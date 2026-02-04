// 表格单元格展开/折叠功能
(function() {
  'use strict';

  // 防止重复初始化的标记
  let isInitialized = false;
  let initTimeout = null;

  function initTableExpand() {
    const tables = document.querySelectorAll('.ratings-table');
    
    tables.forEach(table => {
      // 检查表格是否已经初始化过
      if (table.dataset.expandInitialized === 'true') {
        return;
      }
      
      const cells = table.querySelectorAll('td:nth-child(3)'); // 第三列（内容列）
      
      cells.forEach(cell => {
        // 检查单元格是否已经初始化过
        if (cell.dataset.expandInitialized === 'true') {
          return;
        }
        
        // 检查是否已经有包装器
        let wrapper = cell.querySelector('.cell-content-wrapper');
        if (!wrapper) {
          const originalHTML = cell.innerHTML.trim();
          // 如果内容为空，跳过
          if (!originalHTML) {
            cell.dataset.expandInitialized = 'true';
            return;
          }
          
          // 创建包装 div
          wrapper = document.createElement('div');
          wrapper.className = 'cell-content-wrapper';
          wrapper.innerHTML = originalHTML;
          cell.innerHTML = '';
          cell.appendChild(wrapper);
        }
        
        // 检查内容是否超过3行
        // 先确保包装器是展开状态来测量实际高度
        const originalClasses = wrapper.className;
        const originalStyle = wrapper.style.cssText;
        
        // 设置为展开状态来测量
        wrapper.className = 'cell-content-wrapper expanded-content';
        wrapper.style.cssText = 'width: 100%; display: block; max-height: none; overflow: visible;';
        
        // 强制重新计算布局
        void wrapper.offsetHeight;
        
        // 获取实际高度
        const naturalHeight = wrapper.scrollHeight;
        
        // 使用CSS中定义的max-height: 4.5em作为阈值
        const computedStyle = getComputedStyle(wrapper);
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        // CSS中定义的是4.5em，对应3行（每行1.5em）
        const maxHeightPx = 4.5 * fontSize;
        
        // 恢复原始状态
        wrapper.className = originalClasses;
        wrapper.style.cssText = originalStyle;
        
        // 如果实际高度超过max-height，添加折叠功能
        if (naturalHeight > maxHeightPx) {
          // 添加折叠类到单元格和包装器
          cell.classList.add('collapsed-cell');
          wrapper.classList.add('collapsed-content');
          
          // 添加点击事件
          cell.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const currentWrapper = this.querySelector('.cell-content-wrapper');
            if (this.classList.contains('expanded')) {
              // 折叠
              this.classList.remove('expanded');
              this.classList.add('collapsed-cell');
              currentWrapper.classList.remove('expanded-content');
              currentWrapper.classList.add('collapsed-content');
            } else {
              // 展开
              this.classList.remove('collapsed-cell');
              this.classList.add('expanded');
              currentWrapper.classList.remove('collapsed-content');
              currentWrapper.classList.add('expanded-content');
            }
          });
          
          // 添加鼠标悬停提示
          cell.title = '点击展开/折叠';
        } else {
          // 内容不超过3行，直接显示为展开状态
          wrapper.classList.add('expanded-content');
        }
        
        // 标记单元格已初始化
        cell.dataset.expandInitialized = 'true';
      });
      
      // 标记表格已初始化
      table.dataset.expandInitialized = 'true';
    });
    
    isInitialized = true;
  }

  // 页面加载完成后初始化
  function runInit() {
    // 防止短时间内多次调用
    if (initTimeout) {
      clearTimeout(initTimeout);
    }
    initTimeout = setTimeout(initTableExpand, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }

  // 仅在使用 Material 的即时导航时，监听真正的页面切换
  // 使用 document$ observable（如果存在）
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      // 重置初始化状态，因为这是真正的页面切换
      isInitialized = false;
      runInit();
    });
  }
})();
