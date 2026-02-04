/**
 * 首页特殊样式处理
 * 1. 导航栏背景与页面背景一致
 * 2. 侧边栏目录保持展开状态
 */

(function() {
  'use strict';

  // 检测是否在首页（index.md）
  function isIndexPage() {
    // 首先检查是否存在 album-cover 元素（最可靠的方式）
    if (document.querySelector('.album-cover') !== null) {
      return true;
    }
    
    // 检查 URL 路径
    const path = window.location.pathname;
    
    // 根路径
    if (path === '/' || path === '') {
      return true;
    }
    
    // 以 / 结尾但不包含章节路径
    if (path.endsWith('/') && !path.includes('/ch') && !path.includes('/sec') && !path.includes('/fin') && !path.includes('/ini') && !path.includes('/chn')) {
      // 检查路径深度（首页通常是根目录或第一级目录）
      const segments = path.split('/').filter(Boolean);
      if (segments.length <= 1) {
        return true;
      }
    }
    
    return false;
  }

  // 设置首页样式
  function applyIndexPageStyles() {
    if (isIndexPage()) {
      document.body.classList.add('index-page');
      expandAllNavItems();
    } else {
      document.body.classList.remove('index-page');
    }
  }

  // 展开所有导航项
  function expandAllNavItems() {
    // 找到所有嵌套的导航项
    const nestedItems = document.querySelectorAll('.md-nav__item--nested');
    
    nestedItems.forEach(item => {
      // 找到 toggle checkbox
      const toggle = item.querySelector(':scope > .md-nav__toggle');
      if (toggle) {
        toggle.checked = true;
      }
      
      // 找到嵌套的 nav 并强制显示
      const nestedNav = item.querySelector(':scope > .md-nav');
      if (nestedNav) {
        nestedNav.style.display = 'block';
        nestedNav.style.opacity = '1';
        nestedNav.style.maxHeight = 'none';
        nestedNav.style.overflow = 'visible';
      }
    });
  }

  // 初始化
  function init() {
    applyIndexPageStyles();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 如果 DOM 已经加载完成，延迟一下再执行确保所有元素都渲染了
    setTimeout(init, 0);
  }

  // 处理 MkDocs Material 的 instant loading（SPA 模式）
  // 监听 location 变化
  let lastLocation = window.location.href;
  
  const checkLocationChange = function() {
    if (window.location.href !== lastLocation) {
      lastLocation = window.location.href;
      // 延迟执行，等待页面内容更新
      setTimeout(init, 50);
    }
  };

  // 使用 MutationObserver 监听主内容区域变化
  const observer = new MutationObserver(function(mutations) {
    checkLocationChange();
  });

  // 监听 document 变化
  observer.observe(document.body, { 
    childList: true, 
    subtree: false 
  });

  // 监听 popstate 事件
  window.addEventListener('popstate', function() {
    setTimeout(init, 50);
  });

  // 监听点击事件（用于 instant loading）
  document.addEventListener('click', function(e) {
    // 检查是否点击了链接
    const link = e.target.closest('a');
    if (link && link.href) {
      // 延迟检查
      setTimeout(init, 100);
    }
  });
})();
