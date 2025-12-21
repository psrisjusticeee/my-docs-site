/* Giscus Comments Integration for MkDocs
 * 
 * 使用说明:
 * 1. 访问 https://github.com/apps/giscus 安装 Giscus app 到你的仓库
 * 2. 访问 https://giscus.app 获取配置信息
 * 3. 在下面的配置中填入你的信息
 */

(function() {
  // 防止重复加载的标志
  let isLoading = false;
  
  // ========== 配置区域 - 请在此修改 ==========
  const config = {
    // 启用评论功能 (设置为 false 可禁用)
    enabled: true,
    
    // GitHub 仓库信息 (格式: "username/repo")
    repo: "psrisjusticeee/tkau02130830",
    
    // 仓库 ID (在 https://giscus.app 获取)
    repoId: "R_kgDOQQB9hQ",
    
    // 分类名称 (例如: "Announcements", "General")
    category: "General",
    
    // 分类 ID (在 https://giscus.app 获取)
    categoryId: "DIC_kwDOQQB9hc4Cxeck",
    
    // 评论显示位置: "top" 或 "bottom"
    position: "bottom",
    
    // 评论主题: "light", "dark", "transparent_dark", "preferred_color_scheme"
    theme: "preferred_color_scheme",
    
    // 语言: "zh-CN", "en", "zh-TW" 等
    lang: "zh-CN",
    
    // 是否启用严格模式 (仅匹配 title)
    strict: false,
    
    // 评论输入框位置: "top" 或 "bottom"
    inputPosition: "bottom",
    
    // 评论加载方式: "lazy" 或 "eager"
    loading: "lazy"
  };
  // ==========================================

  // 如果未启用或配置不完整，则不加载评论
  if (!config.enabled || !config.repo || !config.repoId || !config.categoryId) {
    if (config.enabled && (!config.repo || !config.repoId || !config.categoryId)) {
      console.warn('Giscus: 评论功能已启用但配置不完整，请检查配置信息');
    }
    return;
  }

  // 创建评论容器
  function createCommentsContainer() {
    const container = document.createElement('div');
    container.id = 'giscus-container';
    container.className = 'giscus-comments';
    container.style.marginTop = '3rem';
    container.style.paddingTop = '2rem';
    container.style.borderTop = '1px solid var(--md-default-fg-color--lightest, rgba(0,0,0,.07))';
    
    // 添加标题
    const title = document.createElement('h2');
    title.textContent = '评论';
    title.style.marginBottom = '1rem';
    title.style.fontSize = '1.25rem';
    container.appendChild(title);
    
    // 添加提示信息
    const notice = document.createElement('div');
    notice.className = 'giscus-notice';
    notice.style.cssText = `
      background: var(--md-default-fg-color--lightest, rgba(0,0,0,.03));
      border-left: 3px solid var(--md-default-fg-color--light, rgba(0,0,0,.3));
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--md-default-fg-color--light, rgba(0,0,0,.7));
    `;
    notice.innerHTML = `
      <strong>💬 评论提示：</strong> 要发表评论，您需要先登录 GitHub 账户。如果您还没有 GitHub 账户，可以 <a href="https://github.com/join" target="_blank" rel="noopener" style="color: var(--md-accent-fg-color, #448aff); text-decoration: underline;">免费注册</a>。
    `;
    container.appendChild(notice);
    
    return container;
  }

  // 加载 Giscus 脚本
  function loadGiscus() {
    // 如果正在加载，则跳过
    if (isLoading) {
      return;
    }
    
    // 先检查是否已存在容器，如果存在则移除
    const existingContainer = document.getElementById('giscus-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // 移除所有可能存在的 giscus script 标签
    const existingScripts = document.querySelectorAll('script[src="https://giscus.app/client.js"]');
    existingScripts.forEach(script => script.remove());
    
    const content = document.querySelector('.md-content__inner');
    
    if (!content) {
      console.warn('Giscus: 未找到内容容器');
      return;
    }

    isLoading = true;
    const container = createCommentsContainer();

    // 根据位置插入评论容器
    if (config.position === 'top') {
      const firstChild = content.querySelector('article .md-typeset');
      if (firstChild) {
        content.insertBefore(container, firstChild);
      } else {
        content.insertBefore(container, content.firstChild);
      }
    } else {
      // 默认插入到文章底部
      const article = content.querySelector('article');
      if (article) {
        article.appendChild(container);
      } else {
        content.appendChild(container);
      }
    }

    // 创建 script 标签加载 Giscus
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId);
    script.setAttribute('data-category', config.category);
    script.setAttribute('data-category-id', config.categoryId);
    script.setAttribute('data-mapping', config.strict ? 'strict' : 'pathname');
    script.setAttribute('data-strict', config.strict ? '1' : '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', config.inputPosition);
    script.setAttribute('data-theme', config.theme);
    script.setAttribute('data-lang', config.lang);
    script.setAttribute('data-loading', config.loading);
    script.crossOrigin = 'anonymous';
    script.async = true;
    
    // 脚本加载完成后重置标志
    script.onload = function() {
      isLoading = false;
    };
    script.onerror = function() {
      isLoading = false;
    };

    container.appendChild(script);
  }

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGiscus);
  } else {
    loadGiscus();
  }

  // 处理 Material 的即时导航 (instant navigation)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      // 延迟加载以确保 DOM 已更新
      setTimeout(loadGiscus, 200);
    });
  }
})();

