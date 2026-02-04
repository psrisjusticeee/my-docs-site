// 时间轴卡片展开/折叠功能
document.addEventListener('DOMContentLoaded', function() {
  initTimelineCards();
});

// 当使用 instant loading 时也需要初始化
if (typeof document$ !== 'undefined') {
  document$.subscribe(function() {
    initTimelineCards();
  });
}

function initTimelineCards() {
  const cards = document.querySelectorAll('.timeline-card');
  
  cards.forEach(function(card) {
    // 跳过已经处理过的卡片
    if (card.dataset.initialized) return;
    card.dataset.initialized = 'true';
    
    // 查找内容段落（支持 p 或已有 timeline-content 包装）
    let content = card.querySelector('.timeline-content');
    
    // 如果没有 timeline-content 包装，找到 p 标签并包装
    if (!content) {
      const paragraphs = card.querySelectorAll('p');
      if (paragraphs.length === 0) return;
      
      // 创建包装容器
      content = document.createElement('div');
      content.className = 'timeline-content';
      
      // 将所有 p 标签移入包装容器
      const firstP = paragraphs[0];
      firstP.parentNode.insertBefore(content, firstP);
      paragraphs.forEach(function(p) {
        content.appendChild(p);
      });
    }
    
    // 检查内容是否需要折叠（超过3行）
    // 先临时展开来测量真实高度
    content.classList.add('expanded');
    const fullHeight = content.scrollHeight;
    content.classList.remove('expanded');
    const collapsedHeight = content.offsetHeight;
    
    // 如果内容不超过折叠高度，不需要展开按钮
    if (fullHeight <= collapsedHeight + 5) {
      content.classList.add('expanded');
      return;
    }
    
    // 添加展开/折叠按钮
    const toggle = document.createElement('button');
    toggle.className = 'timeline-toggle';
    toggle.textContent = '展开';
    toggle.type = 'button';
    
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = content.classList.toggle('expanded');
      toggle.classList.toggle('expanded', isExpanded);
      toggle.textContent = isExpanded ? '收起' : '展开';
    });
    
    // 将按钮插入到内容后面
    content.parentNode.insertBefore(toggle, content.nextSibling);
  });
}

