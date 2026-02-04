// 心电图脉搏进度指示器 + 动态生命体征
(function() {
  'use strict';

  let progressIndicator = null;
  let isInitialized = false;
  let eventTimeData = []; // 存储解析后的事件时间数据

  // 点子 E：定义每个时间节点的生命体征数据
  const vitalSignsData = [
    { year: '1997', hr: 72, status: 'normal', label: '初识' },
    { year: '1999', hr: 85, status: 'elevated', label: '恋爱' },
    { year: '2002', hr: 78, status: 'normal', label: '相遇高时珍' },
    { year: '2003-03', hr: 110, status: 'critical', label: 'SARS' },
    { year: '2003-05', hr: 88, status: 'elevated', label: '购房' },
    { year: '2003-09', hr: 95, status: 'elevated', label: 'BST' },
    { year: '2009', hr: 82, status: 'normal', label: '专科医生' },
    { year: '2011', hr: 75, status: 'normal', label: '圣诞' },
    { year: '2012-01', hr: 105, status: 'elevated', label: '遴选开始' },
    { year: '2012-10', hr: 130, status: 'critical', label: '最终角逐' }
  ];

  // 解析中文时间字符串为数值（用于计算时间轴位置）
  function parseChineseDate(dateStr) {
    if (!dateStr) return null;
    
    // 处理时间跨度（取开始时间）
    // 格式："1999年9月—2000年7月" 或 "2003年9月—2009年7月"
    if (dateStr.includes('—') || dateStr.includes('-')) {
      const parts = dateStr.split(/[—\-]/);
      dateStr = parts[0].trim();
    }
    
    let year = null;
    let month = 1; // 默认1月
    let day = 1; // 默认1日
    
    // 尝试提取年份
    const yearMatch = dateStr.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    } else {
      return null;
    }
    
    // 尝试提取月份
    const monthMatch = dateStr.match(/(\d{1,2})月/);
    if (monthMatch) {
      month = parseInt(monthMatch[1]);
    } else if (dateStr.includes('初')) {
      // "2012年初" -> 约2月
      month = 2;
    }
    
    // 尝试提取日期
    const dayMatch = dateStr.match(/(\d{1,2})日/);
    if (dayMatch) {
      day = parseInt(dayMatch[1]);
    } else if (dateStr.includes('上旬')) {
      day = 5;
    } else if (dateStr.includes('中旬')) {
      day = 15;
    } else if (dateStr.includes('下旬')) {
      day = 25;
    } else if (dateStr.includes('初') && monthMatch) {
      // "2003年5月初" -> 约5日
      day = 5;
    }
    
    // 转换为小数年份（便于计算比例）
    return year + (month - 1) / 12 + (day - 1) / 365;
  }

  function createProgressIndicator() {
    if (document.querySelector('.ecg-progress-indicator')) {
      return document.querySelector('.ecg-progress-indicator');
    }

    const indicator = document.createElement('div');
    indicator.className = 'ecg-progress-indicator';
    indicator.innerHTML = `
      <span class="ecg-progress-heart">♥</span>
      <div class="ecg-progress-track">
        <div class="ecg-progress-wave" style="height: 0%"></div>
      </div>
      <span class="ecg-progress-percent">0%</span>
    `;
    document.body.appendChild(indicator);
    return indicator;
  }

  function updateMonitorVitals(progress) {
    const monitor = document.querySelector('.ecg-monitor');
    if (!monitor) return;

    // 根据进度确定当前时间节点
    const nodeIndex = Math.min(
      Math.floor((progress / 100) * vitalSignsData.length),
      vitalSignsData.length - 1
    );
    const currentVitals = vitalSignsData[nodeIndex];

    // 更新顶部心形图标的动画速度（不修改 events 数字）
    const eventsDisplay = monitor.querySelector('.ecg-monitor-value');
    if (eventsDisplay) {
      const heartIcon = eventsDisplay.querySelector('.heart-icon');
      
      // 根据状态调整心跳速度 - 冷静蓝调配色
      if (heartIcon) {
        if (currentVitals.status === 'critical') {
          heartIcon.style.animationDuration = '0.4s';
          heartIcon.style.color = '#f85149';
        } else if (currentVitals.status === 'elevated') {
          heartIcon.style.animationDuration = '0.7s';
          heartIcon.style.color = '#d29922';
        } else {
          heartIcon.style.animationDuration = '1s';
          heartIcon.style.color = '#f85149';
        }
      }
    }

    // 更新波形颜色和速度 - 冷静蓝调配色
    const waveElement = monitor.querySelector('.ecg-monitor-wave');
    if (waveElement) {
      if (currentVitals.status === 'critical') {
        waveElement.style.animationDuration = '1s';
        waveElement.style.filter = 'drop-shadow(0 0 12px rgba(248, 81, 73, 0.9)) hue-rotate(-10deg)';
      } else if (currentVitals.status === 'elevated') {
        waveElement.style.animationDuration = '1.8s';
        waveElement.style.filter = 'drop-shadow(0 0 8px rgba(210, 153, 34, 0.7)) hue-rotate(30deg)';
      } else {
        waveElement.style.animationDuration = '2.5s';
        waveElement.style.filter = 'drop-shadow(0 0 8px rgba(57, 211, 83, 0.7))';
      }
    }

    // 更新底部状态栏的心率 - 冷静蓝调配色
    const footerSpans = monitor.querySelectorAll('.ecg-monitor-footer span');
    footerSpans.forEach(span => {
      if (span.textContent.includes('HR:')) {
        span.textContent = 'HR: ' + currentVitals.hr + ' BPM';
        if (currentVitals.status === 'critical') {
          span.style.color = '#f85149';
        } else if (currentVitals.status === 'elevated') {
          span.style.color = '#d29922';
        } else {
          span.style.color = '#94a3b8';
        }
      }
    });

    // 更新状态指示灯 - 冷静蓝调配色
    const statusDot = monitor.querySelector('.status-dot');
    if (statusDot) {
      if (currentVitals.status === 'critical') {
        statusDot.style.background = '#f85149';
        statusDot.style.boxShadow = '0 0 12px rgba(248, 81, 73, 0.9)';
        statusDot.style.animationDuration = '0.5s';
      } else if (currentVitals.status === 'elevated') {
        statusDot.style.background = '#d29922';
        statusDot.style.boxShadow = '0 0 10px rgba(210, 153, 34, 0.8)';
        statusDot.style.animationDuration = '1s';
      } else {
        statusDot.style.background = '#39d353';
        statusDot.style.boxShadow = '0 0 8px rgba(57, 211, 83, 0.8)';
        statusDot.style.animationDuration = '2s';
      }
    }
  }

  function updateProgress() {
    if (!progressIndicator) return;

    const timeline = document.querySelector('.timeline');
    if (!timeline) {
      progressIndicator.classList.remove('visible');
      return;
    }

    const timelineRect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const timelineTop = timelineRect.top;
    const timelineBottom = timelineRect.bottom;
    const timelineHeight = timelineRect.height;

    if (timelineBottom < 0 || timelineTop > viewportHeight) {
      progressIndicator.classList.remove('visible');
      return;
    }

    progressIndicator.classList.add('visible');

    const scrollableDistance = timelineHeight - viewportHeight;
    const scrolled = Math.max(0, -timelineTop);
    const progress = Math.min(100, Math.max(0, (scrolled / scrollableDistance) * 100));

    // 更新进度条
    const wave = progressIndicator.querySelector('.ecg-progress-wave');
    const percent = progressIndicator.querySelector('.ecg-progress-percent');
    
    if (wave) {
      wave.style.height = progress + '%';
    }
    if (percent) {
      percent.textContent = Math.round(progress) + '%';
    }

    // 根据进度调整心跳速度
    const heart = progressIndicator.querySelector('.ecg-progress-heart');
    if (heart) {
      const animationDuration = 1.5 - (progress / 100) * 0.8;
      heart.style.animationDuration = animationDuration + 's';
    }

    // 点子 E：更新监护仪生命体征
    updateMonitorVitals(progress);
    
    // 更新迷你时间轴
    updateMiniTimeline(progress);
  }

  function updateEventsCount() {
    // 自动计算时间轴上的卡片数量
    const timeline = document.querySelector('.timeline');
    const monitor = document.querySelector('.ecg-monitor');
    if (!timeline || !monitor) return;

    const timelineItems = timeline.querySelectorAll('.timeline-item');
    const eventsCount = timelineItems.length;

    // 更新 events 计数显示
    const eventsDisplay = monitor.querySelector('.ecg-monitor-value');
    if (eventsDisplay) {
      const heartIcon = eventsDisplay.querySelector('.heart-icon');
      // 保留心形图标，更新数字
      if (heartIcon) {
        // 找到数字文本节点并更新
        const textNodes = Array.from(eventsDisplay.childNodes).filter(
          node => node.nodeType === Node.TEXT_NODE
        );
        if (textNodes.length > 0) {
          textNodes[textNodes.length - 1].textContent = ' ' + eventsCount;
        }
      }
    }

    // 创建迷你时间轴上的事件点
    initMiniTimeline(timeline, monitor, timelineItems);
  }

  function initMiniTimeline(timeline, monitor, timelineItems) {
    const miniTimelineEvents = monitor.querySelector('.ecg-mini-timeline-events');
    if (!miniTimelineEvents || miniTimelineEvents.children.length > 0) return;

    // 清空之前存储的时间数据
    eventTimeData = [];
    
    // 解析所有事件的时间
    timelineItems.forEach((item, index) => {
      const yearSpan = item.querySelector('.timeline-year');
      const dateStr = yearSpan ? yearSpan.textContent.trim() : '';
      const numericTime = parseChineseDate(dateStr);
      
      eventTimeData.push({
        index: index,
        dateStr: dateStr,
        numericTime: numericTime,
        isCritical: item.classList.contains('critical')
      });
    });
    
    // 计算时间范围
    const validTimes = eventTimeData.filter(e => e.numericTime !== null).map(e => e.numericTime);
    const minTime = Math.min(...validTimes);
    const maxTime = Math.max(...validTimes);
    const timeRange = maxTime - minTime;
    
    // 更新标签显示实际年份
    const startLabel = monitor.querySelector('.ecg-mini-timeline-labels span:first-child');
    const endLabel = monitor.querySelector('.ecg-mini-timeline-labels span:last-child');
    if (startLabel) startLabel.textContent = Math.floor(minTime);
    if (endLabel) endLabel.textContent = Math.floor(maxTime);
    
    // 同时更新顶部的时间范围显示
    const rangeDisplay = monitor.querySelector('.ecg-monitor-range');
    if (rangeDisplay) {
      rangeDisplay.textContent = Math.floor(minTime) + ' — ' + Math.floor(maxTime);
    }
    
    // 为每个事件创建一个点（根据实际时间比例定位）
    eventTimeData.forEach((event, index) => {
      const dot = document.createElement('div');
      dot.className = 'ecg-mini-timeline-dot';
      dot.dataset.index = index;
      dot.dataset.date = event.dateStr;
      
      // 检查是否是关键事件
      if (event.isCritical) {
        dot.classList.add('critical');
      }
      
      // 根据实际时间比例计算位置
      let position = 0;
      if (event.numericTime !== null && timeRange > 0) {
        position = ((event.numericTime - minTime) / timeRange) * 100;
      } else {
        // 如果无法解析时间，则使用均匀分布
        position = (index / (eventTimeData.length - 1)) * 100;
      }
      dot.style.left = position + '%';
      
      // 添加 tooltip 显示具体时间
      dot.title = event.dateStr;
      
      miniTimelineEvents.appendChild(dot);
    });
  }

  function updateMiniTimeline(progress) {
    const monitor = document.querySelector('.ecg-monitor');
    if (!monitor || eventTimeData.length === 0) return;

    // 计算时间范围
    const validTimes = eventTimeData.filter(e => e.numericTime !== null).map(e => e.numericTime);
    const minTime = Math.min(...validTimes);
    const maxTime = Math.max(...validTimes);
    const timeRange = maxTime - minTime;
    
    // 根据滚动进度计算当前时间点
    const currentTime = minTime + (progress / 100) * timeRange;

    // 更新进度条和光标位置
    const progressBar = monitor.querySelector('.ecg-mini-timeline-progress');
    const cursor = monitor.querySelector('.ecg-mini-timeline-cursor');
    
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
    if (cursor) {
      cursor.style.left = progress + '%';
    }

    // 更新事件点状态
    const dots = monitor.querySelectorAll('.ecg-mini-timeline-dot');
    
    dots.forEach((dot, index) => {
      const eventData = eventTimeData[index];
      if (!eventData) return;
      
      dot.classList.remove('active', 'passed');
      
      // 根据实际时间位置判断状态
      const dotPosition = parseFloat(dot.style.left);
      
      // 当前激活的事件（在当前进度附近）
      const tolerance = 100 / eventTimeData.length / 2;
      if (Math.abs(dotPosition - progress) < tolerance) {
        dot.classList.add('active');
      } else if (dotPosition < progress) {
        dot.classList.add('passed');
      }
    });
  }

  function initEcgProgress() {
    if (isInitialized) return;
    
    progressIndicator = createProgressIndicator();
    
    // 更新 events 计数
    updateEventsCount();
    
    updateProgress();
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    
    isInitialized = true;
  }

  function cleanupEcgProgress() {
    if (progressIndicator) {
      progressIndicator.classList.remove('visible');
    }
    isInitialized = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEcgProgress);
  } else {
    initEcgProgress();
  }

  document.addEventListener('mkdocs-before-ready', cleanupEcgProgress);
  document.addEventListener('mkdocs-ready', function() {
    isInitialized = false;
    initEcgProgress();
  });
})();
