// autocorrect: false
$(function () {
  // 默认搜索引擎记录
  var searchTypeStore = {
    set: function (type) {
      localStorage.setItem('SearchType', type);
    },
    get: function () {
      return localStorage.getItem('SearchType') || 'google';
    },
  };
  var $searchMethods = $('#search_methods');
  var $searchLogo = $('#search_logo');
  var initSearchType = searchTypeStore.get();
  $searchLogo.addClass(initSearchType).data('type', initSearchType);
  var search_types = [
    { url: 'https://www.baidu.com/s?wd=', type: 'baidu' },
    { url: 'https://www.sogou.com/web?query=', type: 'sogou' },
    { url: 'https://cn.bing.com/search?q=', type: 'bing' },
    { url: 'https://www.so.com/s?q=', type: 'so' },
    { url: 'https://www.google.com/search?q=', type: 'google' },
    { url: 'http://www.cilimao.cc/search?word=', type: 'cili' },
    { url: 'http://neets.cc/search?key=', type: 'yingyin' },
    { url: 'http://www.panduoduo.net/s/name/', type: 'wangpan' },
    { url: 'https://search.jd.com/Search?keyword=', type: 'jingdong' },
    { url: 'https://github.com/search?q=', type: 'github' },
    { url: 'https://s.taobao.com/search?q=', type: 'taobao' },
    { url: 'https://www.whois.com/whois/', type: 'whois' },
  ];
  $searchLogo.on('click', function () {
    $searchMethods.show();
  });

/*兼容处理 低版本 IE*/
//
Array.prototype.find || (Array.prototype.find = function (predicate) {
  if (this == null) {
    throw new TypeError('Array.prototype.find called on null or undefined');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  var list = Object(this);
  var length = list.length || 0;
  var thisArg = arguments[1];
  var value;

  for (var i = 0; i < length; i++) {
    value = list[i];
    if (predicate.call(thisArg, value, i, list)) {
      return value;
    }
  }
  return null;
})

  // 搜索引擎切换
  $searchMethods.on('click', 'li', function () {
    var type = $(this).data('type');
    searchTypeStore.set(type);
    $searchLogo.removeClass()
    .data('type', type)
    .addClass(type + ' search-logo');
    $searchMethods.hide();
    $('#search_keyword').focus();
  });
  $searchMethods.on('mouseleave', function () {
    $searchMethods.hide();
  });
  var EVENT_CLEAR_KEYWORD = 'clearKeyword';
  var EVENT_SEARCH = 'search';
  // 关键词搜索输入
  $('#search_keyword').on('keyup', function (event) {
    var $keyword = $(this);
    var keyword = $keyword.val();
    if(event.which==13){
    	if($('#search_result .active').length>0){
    		keyword = $('#search_result .active').eq(0).text();
    	}
      openSearch(keyword)
      return;
    }
// 关键词联想提示，跟其他 2 个插件冲突，因为我只用 Google ，没有 fix。
    // TODO 上下键选择待选答案
    var bl = moveChange(event);
    if(bl){
    	keywordChange(keyword);
    }
  }).on('blur', function () {
    $('#search_result').hide();
  }).on('focus', function () {
    var keyword = $(this).val();
    keywordChange(keyword);
  });
  function moveChange(e){
		var k = e.keyCode || e.which;
		var bl = true;
		switch(k){
			case 38:
				rowMove('top');
				bl = false;
				break;
			case 40:
				rowMove('down');
				bl = false;
				break;
		}
		return bl;
	}
  function rowMove(move){
  	var search_result = $('#search_result');
  	var hove_li = null;
  	search_result.find('.result-item').each(function(){
  		if($(this).hasClass('active')){
  			hove_li = $(this).index();
  		}
  	});
  	if(move == 'top'){
  		if(hove_li==null){
	  		hove_li = search_result.find('.result-item').length-1;
	  	}else{
	  		hove_li--;
	  	}
  	}else if(move == 'down'){
  		if(hove_li==null){
	  		hove_li = 0;
	  	}else{
	  		hove_li==search_result.find('.result-item').length-1?(hove_li=0):(hove_li++);
	  	}
  	}
  	search_result.find('.active').removeClass('active');
  	search_result.find('.result-item').eq(hove_li).addClass('active');
  }
  function keywordChange(keyword) {
    if (keyword === '') {
      $(document).trigger(EVENT_CLEAR_KEYWORD);
    } else {
      $(document).trigger(EVENT_SEARCH, keyword);
      $('#clear_keyword').show();
    }
  }
  // 清空输入框
  $('#clear_keyword').on('click', function () {
    $('#search_keyword').val('');
    $('#search_keyword').focus();
    $(document).trigger(EVENT_CLEAR_KEYWORD);
  });
  // 点击高亮显示
  $('#search_keyword').on('focus',  function () {
    $('.search-left').css(
      {
        "border-style":"solid",
        "border-color": "rgba(24, 144, 255, 1)",
        "box-shadow": "0px 0px 2px 1px rgba(145, 213, 255, 0.96)",
      }
    );
  }).on('blur',  function () {
    $('.search-left').prop('style','');
  });
  // 搜索
  $('#search_submit').on('click', function () {
    var keyword = $('#search_keyword').val();
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword);
    }
  });
  // 推荐结果跳转
  $('#search_result').on('click', 'li', function () {
    var word = $(this).text();
    $('#search_keyword').val(word);
    openSearch(word);
    $('#search_result').hide();
  });
  $(document).on(EVENT_CLEAR_KEYWORD, function () {
    $('#clear_keyword').hide();
    $('#search_result').hide();
  });
  $(document).on(EVENT_SEARCH, function (e, keyword) {
    getSearchResult(keyword);
  });
  // 获取搜索引擎类型
  function getSeachType() {
    return $('#search_logo').data('type');
  }
  // google 搜索结果
  function searchResultGoogle(data) {
    var result = data[1];
    result = result.map(function (item) {
      return item[0];
    });
    renderSearchResult(result);
  }
  // 百度 搜索结果
  function searchResultBaidu(data) {
    if (data === undefined) {
      return;
    }
    var result = data.s;
    renderSearchResult(result);
  }
  // 渲染搜索结果
  function renderSearchResult(array) {
    var $result = $('#search_result');
    $result.empty().hide();
    if (!array || array.length <= 0) {
      return;
    }
    for (var i = 0; i < array.length; i++) {
      var $li = $('<li class=\'result-item\'></li>');
      $li.text(array[i]);
      $result.append($li);
    }
    $result.show();
  }
  window.searchResultGoogle = searchResultGoogle;
  window.searchResultBaidu = searchResultBaidu;
  var search_suggest = {
    baidu: {
      url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
    google: {
      url: 'http://suggestqueries.google.com/complete/search',
      data: function (keyword) {
        return {
          q: keyword,
          jsonp: 'window.searchResultGoogle',
          client: 'youtube',
        };
      },
    },
    wangpan: {
      url: 'http://unionsug.baidu.com/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
  };
  function getSearchResult(keyword) {
    var searchType = getSeachType();
    var suggest = search_suggest[searchType];
    if (!suggest) {
      suggest = search_suggest.baidu;
    }
    $.ajax({
      url: suggest.url,
      dataType: 'jsonp',
      data: suggest.data(keyword),
    });
  }
  function openSearch(keyword) {
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword);
    }
  }
});

// 新窗口中打开
$(document).bind('DOMNodeInserted', function(event) {
  $('a[href^="http"]').each(
        function(){
          if (!$(this).attr('target')) {
              $(this).attr('target', '_blank')
          }
        }
    );
});

// lazyload
(function () {
  function logElementEvent(eventName, element) {
      console.log(Date.now(), eventName, element.getAttribute("data-src"));
  }

  var callback_enter = function (element) {
      logElementEvent("🔑 ENTERED", element);
  };
  var callback_exit = function (element) {
      logElementEvent("🚪 EXITED", element);
  };
  var callback_loading = function (element) {
      logElementEvent("⌚ LOADING", element);
  };
  var callback_loaded = function (element) {
      logElementEvent("👍 LOADED", element);
  };
  var callback_error = function (element) {
      logElementEvent("💀 ERROR", element);
      element.src = "https://via.placeholder.com/440x560/?text=Error+Placeholder";
  };
  var callback_finish = function () {
      logElementEvent("✔️ FINISHED", document.documentElement);
  };
  var callback_cancel = function (element) {
      logElementEvent("🔥 CANCEL", element);
  };

  var ll = new LazyLoad({
      class_applied: "lz-applied",
      class_loading: "lz-loading",
      class_loaded: "lz-loaded",
      class_error: "lz-error",
      class_entered: "lz-entered",
      class_exited: "lz-exited",
      // Assign the callbacks defined above
      callback_enter: callback_enter,
      callback_exit: callback_exit,
      callback_cancel: callback_cancel,
      callback_loading: callback_loading,
      callback_loaded: callback_loaded,
      callback_error: callback_error,
      callback_finish: callback_finish
  });
})();

// Time
function update() {
  $('#clock').html(moment().format('YYYY年MM月DD日 HH:mm:ss'));
}
setInterval(update, 1000);

// 时间提示语
var myDate = new Date();
var hrs = myDate.getHours();
var greet;
if (hrs >= 0 && hrs < 6)
    greet = '凌晨好！<br /> 欢迎光临';
else if (hrs >= 6 && hrs < 9)
    greet = '早上好！<br /> 欢迎光临';
else if (hrs >= 9 && hrs < 11)
    greet = '上午好！<br /> 欢迎光临';
else if (hrs >= 11 && hrs < 13)
    greet = '中午好！<br /> 欢迎光临';
else if (hrs >= 13 && hrs < 18)
    greet = '下午好！<br /> 欢迎光临';
else if (hrs >= 18 && hrs <= 24)
    greet = '晚上好！<br /> 欢迎光临';
document.getElementById('greetings').innerHTML = greet ;

// 和风天气
WIDGET = {
  "CONFIG": {
    "modules": "1024",
    "background": "5",
    "tmpColor": "333333",
    "tmpSize": "16",
    "cityColor": "333333",
    "citySize": "16",
    "aqiColor": "333333",
    "aqiSize": "16",
    "weatherIconSize": "24",
    "alertIconSize": "18",
    "padding": "5px 5px 5px 5px",
    "shadow": "0",
    "language": "zh",
    "fixed": "false",
    "vertical": "left",
    "horizontal": "right",
    //"city": "CN101201002",
    "key": "b31457ad265f42d0ae71b36f4b04b40e"
  }
}

// 今日诗词
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://v1.jinrishici.com/shuqing/youqing.json');
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
    var data = JSON.parse(xhr.responseText);
    var gushici = document.getElementById('gushici');
    var poem_info = document.getElementById('poem_info');
    gushici.innerHTML = '<a href="https://www.google.com/search?q=' + data.content + '" target="_blank" rel="noopener noreferrer">' +data.content + '</a>';
    poem_info.innerHTML = '— ' + '<a href="https://www.google.com/search?q=' + data.author + ' ' + data.origin + '" target="_blank" rel="noopener noreferrer">' + data.author + '《' + data.origin + '》' + '</a>';
    }
};
xhr.send();