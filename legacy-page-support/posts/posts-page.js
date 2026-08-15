(function(){
  var tries = 0;
  var maxTries = 40;

  function waitForPostsPage(){
    tries++;

    var page = document.getElementById('hrv-posts-page');
    var feed = document.getElementById('hrv-post-feed');

    if(page && feed){
      initPostsPage(page, feed);
      return;
    }

    if(tries < maxTries){
      setTimeout(waitForPostsPage, 250);
    }
  }

  function initPostsPage(page, feed){
    if(page.getAttribute('data-hrv-posts-script') === 'running') return;
    page.setAttribute('data-hrv-posts-script','running');

    var debug = /[?&]debug=1/.test(location.search);
    function log(){
      if(debug && window.console){
        console.log.apply(console, arguments);
      }
    }

    var WP_BASE = location.origin;
    var PER_PAGE = 8;
    var allPosts = [];
    var visibleCount = 5;

    var searchInput = document.getElementById('hrv-post-search');
    var loadMore = document.getElementById('hrv-load-more-posts');

    function strip(value){
      if(value && typeof value === 'object'){
        if(value.rendered) value = value.rendered;
        else if(value.text) value = value.text;
        else value = '';
      }

      return String(value || '').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    }

    function escapeHtml(value){
      return String(value || '')
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
    }

    function formatDate(dateString){
      try{
        var date = new Date(dateString);
        return date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
      }catch(error){
        return '';
      }
    }

    function firstImageFromContent(post){
      var html = '';

      if(post.content && post.content.rendered){
        html = post.content.rendered;
      }else if(typeof post.content === 'string'){
        html = post.content;
      }

      if(!html) return '';

      var match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      return match && match[1] ? match[1] : '';
    }

    function featuredImageFromEmbed(post){
      try{
        if(
          post._embedded &&
          post._embedded['wp:featuredmedia'] &&
          post._embedded['wp:featuredmedia'][0]
        ){
          var media = post._embedded['wp:featuredmedia'][0];
          var sizes = media.media_details && media.media_details.sizes ? media.media_details.sizes : {};

          return (sizes.medium_large && sizes.medium_large.source_url) ||
                 (sizes.large && sizes.large.source_url) ||
                 (sizes.full && sizes.full.source_url) ||
                 media.source_url ||
                 '';
        }
      }catch(error){}

      return '';
    }

    function imageForPost(post){
      return featuredImageFromEmbed(post) || firstImageFromContent(post);
    }

    function postMatches(post, query){
      if(!query) return true;

      var title = strip(post.title || '');
      var excerpt = strip(post.excerpt || '');
      var hay = (title + ' ' + excerpt).toLowerCase();

      return hay.indexOf(query.toLowerCase()) !== -1;
    }

    function render(){
      var query = searchInput ? searchInput.value.trim() : '';
      var filtered = allPosts.filter(function(post){
        return postMatches(post, query);
      });

      var shown = filtered.slice(0, visibleCount);

      if(!shown.length){
        feed.innerHTML = '<div class="hrv-status">No classroom updates matched that search.</div>';
        if(loadMore) loadMore.style.display = 'none';
        return;
      }

      feed.innerHTML = '';

      shown.forEach(function(post){
        var link = post.link || '#';
        var title = strip(post.title || 'Classroom Update');
        var excerpt = strip(post.excerpt || '');
        var image = imageForPost(post);

        if(excerpt.length > 190){
          excerpt = excerpt.slice(0,187).replace(/\s+\S*$/,'') + '…';
        }

        var thumbHtml = '';

        if(image){
          thumbHtml =
            '<span class="hrv-post-thumb">' +
              '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '">' +
              '<span class="hrv-post-thumb-label">Post highlight</span>' +
            '</span>';
        }

        var card = document.createElement('a');
        card.className = 'hrv-post-card';
        card.href = link;

        card.innerHTML =
          '<div class="hrv-post-inner">' +
            thumbHtml +
            '<span class="hrv-post-date">' + formatDate(post.date || post.pubDate || '') + '</span>' +
            '<h3>' + title + '</h3>' +
            '<p class="hrv-post-excerpt">' + excerpt + '</p>' +
            '<span class="hrv-post-go">Read update →</span>' +
          '</div>';

        feed.appendChild(card);
      });

      if(loadMore){
        loadMore.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
        loadMore.disabled = filtered.length <= visibleCount;
      }
    }

    async function fetchPostsRest(){
      var collected = [];
      var pageNum = 1;
      var totalPages = 1;

      do{
        var url = WP_BASE + '/wp-json/wp/v2/posts?per_page=' + PER_PAGE +
          '&page=' + pageNum +
          '&orderby=date&order=desc' +
          '&_embed=wp:featuredmedia' +
          '&_fields=link,date,title,excerpt,content,_embedded';

        var response = await fetch(url,{cache:'no-store'});
        log('[hrv-posts-page] REST page', pageNum, 'status', response.status, 'total pages', response.headers.get('X-WP-TotalPages'));

        if(!response.ok){
          throw new Error('Posts REST failed: HTTP ' + response.status);
        }

        totalPages = Math.min(parseInt(response.headers.get('X-WP-TotalPages') || '1',10) || 1, 20);

        var batch = await response.json();
        if(Array.isArray(batch)){
          collected = collected.concat(batch);
        }

        pageNum++;
      }while(pageNum <= totalPages);

      return collected;
    }

    async function fetchPostsFeed(){
      var response = await fetch(WP_BASE + '/feed/?_=' + Date.now(),{cache:'no-store'});
      log('[hrv-posts-page] feed status', response.status);

      if(!response.ok){
        throw new Error('Feed failed: HTTP ' + response.status);
      }

      var text = await response.text();
      var parser = new DOMParser();
      var xml = parser.parseFromString(text,'text/xml');
      var items = xml.getElementsByTagName('item');
      var posts = [];

      for(var i=0;i<items.length;i++){
        var item = items[i];

        function getTag(name){
          var node = item.getElementsByTagName(name)[0];
          return node ? node.textContent : '';
        }

        var description = getTag('description') || '';
        var imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        var image = imageMatch && imageMatch[1] ? imageMatch[1] : '';

        posts.push({
          title:getTag('title') || 'Classroom Update',
          link:getTag('link') || '#',
          pubDate:getTag('pubDate') || '',
          excerpt:description,
          content:image ? '<img src="' + image + '">' : ''
        });
      }

      return posts;
    }

    async function load(){
      feed.innerHTML = '<div class="hrv-status">Looking for classroom updates…</div>';

      try{
        allPosts = await fetchPostsRest();
      }catch(restError){
        log('[hrv-posts-page] REST failed, trying feed', restError);

        try{
          allPosts = await fetchPostsFeed();
        }catch(feedError){
          log('[hrv-posts-page] feed failed', feedError);
          feed.innerHTML = '<div class="hrv-status">Classroom updates could not load automatically right now.</div>';
          if(loadMore) loadMore.style.display = 'none';
          return;
        }
      }

      if(!allPosts.length){
        feed.innerHTML = '<div class="hrv-status">Latest classroom updates will appear here after posts are published.</div>';
        if(loadMore) loadMore.style.display = 'none';
        return;
      }

      render();
    }

    if(searchInput){
      searchInput.addEventListener('input',function(){
        visibleCount = 5;
        render();
      });
    }

    if(loadMore){
      loadMore.addEventListener('click',function(){
        visibleCount += 5;
        render();
      });
    }

    load();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', waitForPostsPage);
  }else{
    waitForPostsPage();
  }
})();
