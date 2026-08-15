(function(){
  var tries = 0;
  var maxTries = 40;

  function waitForHome(){
    tries++;

    var page = document.getElementById('hrv-page');
    var rail = document.getElementById('hrv-photo-rail');
    var postsMount = document.getElementById('hrv-latest-posts');

    if(page && (rail || postsMount)){
      initHome(page, rail, postsMount);
      return;
    }

    if(tries < maxTries){
      setTimeout(waitForHome, 250);
    }
  }

  function initHome(page, rail, postsMount){
    if(page.getAttribute('data-hrv-home-script') === 'running') return;
    page.setAttribute('data-hrv-home-script','running');

    var debug = /[?&]debug=1/.test(location.search);
    function log(){
      if(debug && window.console){
        console.log.apply(console, arguments);
      }
    }

    var opener = page.querySelector('.hrv-opener');
    var skip = page.querySelector('.hrv-skip');

    function closeOpener(){
      if(opener){
        opener.style.display = 'none';
        opener.setAttribute('aria-hidden','true');
      }
    }

    if(skip){
      skip.onclick = closeOpener;
    }

    setTimeout(closeOpener, 2150);

    var WP_BASE = location.origin;
    var PER_PAGE = 10;
    var MAX_PAGES = 50;
    var PHOTO_POOL_MAX = 30;
    var ALBUM_FILTER = 'DriveSync';

    var memoryImgs = [
      document.getElementById('hrv-memory-img-1'),
      document.getElementById('hrv-memory-img-2'),
      document.getElementById('hrv-memory-img-3')
    ];

    var memoryTitles = [
      document.getElementById('hrv-memory-title-1'),
      document.getElementById('hrv-memory-title-2'),
      document.getElementById('hrv-memory-title-3')
    ];

    function strip(value){
      if(value && typeof value === 'object'){
        if(value.rendered) value = value.rendered;
        else if(value.text) value = value.text;
        else value = '';
      }

      return String(value || '').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    }

    function bestThumb(media){
      var sizes = (media.media_details && media.media_details.sizes) || {};
      return (sizes.medium_large && sizes.medium_large.source_url)
          || (sizes.large && sizes.large.source_url)
          || (sizes.medium && sizes.medium.source_url)
          || media.source_url;
    }

    function normalize(media){
      return {
        id: media.id,
        name: (media.title && media.title.rendered) ? strip(media.title.rendered) : (media.slug || 'Classroom memory'),
        caption: (media.caption && media.caption.rendered) ? strip(media.caption.rendered) : '',
        thumb: bestThumb(media),
        full: media.source_url,
        updated: media.date_gmt || media.modified_gmt || ''
      };
    }

    function fetchPage(pageNum){
      var url = WP_BASE + '/wp-json/wp/v2/media?media_type=image&orderby=date&order=desc'
              + '&per_page=' + PER_PAGE
              + '&page=' + pageNum
              + '&_=' + (Date.now() + '_' + pageNum);

      return fetch(url,{cache:'no-store'}).then(function(response){
        log('[hrv-home] media page', pageNum, 'status', response.status, 'total pages', response.headers.get('X-WP-TotalPages'));

        if(!response.ok){
          throw new Error('Media page ' + pageNum + ' failed: HTTP ' + response.status);
        }

        return response.json().then(function(items){
          return {
            items: items,
            totalPages: Math.min(parseInt(response.headers.get('X-WP-TotalPages') || '1',10) || 1, MAX_PAGES)
          };
        });
      });
    }

    function setMemoryMessage(message){
      for(var i=0;i<memoryTitles.length;i++){
        if(memoryTitles[i]){
          memoryTitles[i].textContent = message;
        }
      }

      var empties = page.querySelectorAll('.hrv-memory-empty');
      for(var j=0;j<empties.length;j++){
        empties[j].textContent = message;
        empties[j].style.display = 'grid';
      }
    }

    function setMemorySlot(slot,item){
      var img = memoryImgs[slot];
      var title = memoryTitles[slot];

      if(!img || !item) return;

      img.classList.remove('is-ready');

      img.onload = function(){
        img.classList.add('is-ready');

        var empty = img.parentNode.querySelector('.hrv-memory-empty');
        if(empty){
          empty.style.display = 'none';
        }
      };

      img.onerror = function(){
        var empty = img.parentNode.querySelector('.hrv-memory-empty');
        if(empty){
          empty.textContent = 'This photo could not load.';
          empty.style.display = 'grid';
        }
      };

      img.src = item.thumb;
      img.alt = item.name || 'Classroom memory';

      if(title){
        title.textContent = item.name || 'Classroom memory';
      }
    }

    async function loadHomePhotos(){
      if(!rail) return;

      try{
        setMemoryMessage('Looking for classroom photos…');

        var first = await fetchPage(1);
        var raw = [];

        if(Array.isArray(first.items)){
          raw = raw.concat(first.items);
        }

        var totalPages = first.totalPages || 1;

        for(var p=2;p<=totalPages;p++){
          try{
            var next = await fetchPage(p);
            if(Array.isArray(next.items) && next.items.length){
              raw = raw.concat(next.items);
            }
          }catch(pageError){
            log('[hrv-home] stopped media paging at', p, pageError);
            break;
          }
        }

        if(!raw.length){
          setMemoryMessage('No classroom photos found yet.');
          return;
        }

        var seen = {};
        var allItems = [];

        raw.forEach(function(media){
          if(!media || seen[media.id]) return;
          seen[media.id] = 1;
          allItems.push(normalize(media));
        });

        var q = ALBUM_FILTER.toLowerCase();

        var driveItems = allItems.filter(function(item){
          var hay = (item.name + ' ' + item.caption).toLowerCase();
          return hay.indexOf(q) !== -1;
        });

        var items = driveItems.length ? driveItems : allItems;

        items.sort(function(a,b){
          return (b.updated > a.updated) ? 1 : (b.updated < a.updated) ? -1 : 0;
        });

        items = items.slice(0, PHOTO_POOL_MAX);

        if(!items.length){
          setMemoryMessage('No classroom photos found yet.');
          return;
        }

        var pointer = Math.floor(Math.random() * items.length);

        function refreshRibbon(){
          for(var i=0;i<3;i++){
            setMemorySlot(i, items[(pointer + i) % items.length]);
          }

          pointer = (pointer + 3) % items.length;
        }

        refreshRibbon();

        if(items.length > 3){
          setInterval(refreshRibbon, 7000);
        }

        log('[hrv-home] photos loaded:', items.length, 'DriveSync matches:', driveItems.length);
      }catch(error){
        log('[hrv-home] photo error', error);
        setMemoryMessage('Photo preview could not load yet.');
      }
    }

    function formatDate(dateString){
      try{
        var date = new Date(dateString);
        return date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
      }catch(error){
        return '';
      }
    }

    function renderPosts(posts){
      if(!postsMount) return;

      if(!posts || !posts.length){
        postsMount.innerHTML = '<div class="hrv-status">Latest classroom updates will appear here after posts are published.</div>';
        return;
      }

      postsMount.innerHTML = '';

      posts.slice(0,3).forEach(function(post){
        var link = post.link || '#';
        var title = strip(post.title || 'Classroom Update');
        var excerpt = strip(post.excerpt || '');

        if(excerpt.length > 145){
          excerpt = excerpt.slice(0,142).replace(/\s+\S*$/,'') + '…';
        }

        var card = document.createElement('a');
        card.className = 'hrv-post-card';
        card.href = link;

        card.innerHTML =
          '<div>' +
            '<span class="hrv-post-date">' + formatDate(post.date || post.pubDate || '') + '</span>' +
            '<h3>' + title + '</h3>' +
            '<p class="hrv-post-excerpt">' + excerpt + '</p>' +
          '</div>' +
          '<span class="hrv-post-go">Read update →</span>';

        postsMount.appendChild(card);
      });
    }

    async function loadPostsFromRest(){
      var url = WP_BASE + '/wp-json/wp/v2/posts?per_page=3&orderby=date&order=desc&_fields=link,date,title,excerpt';

      var response = await fetch(url,{cache:'no-store'});
      log('[hrv-home] posts REST status', response.status);

      if(!response.ok){
        throw new Error('Posts REST failed: HTTP ' + response.status);
      }

      return response.json();
    }

    async function loadPostsFromFeed(){
      var response = await fetch(WP_BASE + '/feed/?_=' + Date.now(),{cache:'no-store'});
      log('[hrv-home] posts feed status', response.status);

      if(!response.ok){
        throw new Error('Feed failed: HTTP ' + response.status);
      }

      var text = await response.text();
      var parser = new DOMParser();
      var xml = parser.parseFromString(text,'text/xml');
      var items = xml.getElementsByTagName('item');
      var posts = [];

      for(var i=0;i<items.length && i<3;i++){
        var item = items[i];

        function getTag(name){
          var node = item.getElementsByTagName(name)[0];
          return node ? node.textContent : '';
        }

        posts.push({
          title: getTag('title') || 'Classroom Update',
          link: getTag('link') || '#',
          pubDate: getTag('pubDate') || '',
          excerpt: getTag('description') || ''
        });
      }

      return posts;
    }

    async function loadPosts(){
      if(!postsMount) return;

      postsMount.innerHTML = '<div class="hrv-status">Looking for latest classroom updates…</div>';

      try{
        var posts = await loadPostsFromRest();
        renderPosts(posts);
      }catch(restError){
        log('[hrv-home] REST posts failed, trying feed', restError);

        try{
          var feedPosts = await loadPostsFromFeed();
          renderPosts(feedPosts);
        }catch(feedError){
          log('[hrv-home] feed posts failed', feedError);
          postsMount.innerHTML = '<div class="hrv-status">Latest Posts block can be placed below this homepage section if the automatic feed is unavailable.</div>';
        }
      }
    }

    loadHomePhotos();
    loadPosts();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', waitForHome);
  }else{
    waitForHome();
  }
})();
