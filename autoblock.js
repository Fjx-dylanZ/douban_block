var myList = [];
var regex_black = /(?<=<dd><a\shref="https:\/\/www\.douban\.com\/people\/)[0-9a-zA-Z]+(?!.+?\[已注销\])/g
var regex_crawl = /(?<=a\shref=")\/people\/.+?\/rev_contacts.+?(?=">后页)/g
var matched = [];
var host_url = "https://www.douban.com";
var params = "";
var regex_cookie = /(?<=\sck=)[a-zA-Z0-9]{4}(?=;)/g
var lastCheck = true;

function request(callback) {
    var xhr = new XMLHttpRequest();
    console.log(newURL);
    console.log("获贱人的Followers中...");
    xhr.open("GET", newURL);
    xhr.onload = function() {
        callback(xhr.response);
    };
    xhr.send();
}

function next() {                                    
    if (parseInt(String(document.getElementsByClassName("info")[0].innerText.match(/(?<=的人\()\d+(?=\))/g))) <= 70) {
      temp = myList.length;
      j = 0;
      for (i = temp; i < temp + document.getElementsByClassName("obu").length; i++) {
        myList[i] = document.getElementsByClassName("obu")[j].innerHTML;
        matched[i] = myList[i].match(regex_black);
        j++;
      }
    } else {
      request(function(response) {                      
          var doc = new DOMParser().parseFromString(response, "text/html"); 
          var a = doc.getElementsByClassName("next");    
          if (a[0].innerHTML.match(regex_crawl) != null || lastCheck) {
              console.log("found")
              params = doc.getElementsByClassName("next")[0].innerHTML.match(regex_crawl);
              newURL = host_url.concat("", params)
              temp = myList.length;
              j = 0;
              for (i = temp; i < temp + doc.getElementsByClassName("obu").length; i++) {
                myList[i] = doc.getElementsByClassName("obu")[j].innerHTML;
                matched[i] = myList[i].match(regex_black);
                j++;
              }
              if (a[0].innerHTML.match(regex_crawl) == null) {
                lastCheck = false;
              } else {
                setTimeout(next, 3000);  
              }
          }
          if (parseInt(String(document.getElementsByClassName("info")[0].innerText.match(/(?<=的人\()\d+(?=\))/g))) == matched.length) {
            byeBitch();
          }
      });
    }
    if (parseInt(String(document.getElementsByClassName("info")[0].innerText.match(/(?<=的人\()\d+(?=\))/g))) == matched.length) {
      byeBitch()
    }
}
function byeBitch() {
  for (var i = 0; i < matched.length; i++) {
    if (matched[i] != null) {
      (function(i){
        setTimeout(
          function() {
            $.ajax({
              url: '/j/contact/addtoblacklist',
              type: "POST",
              data: {
                people: String(matched[i]),
                ck: usr_cookies_id
              },
              success: function(data){
                console.log(JSON.stringify(data));
                if (String(JSON.stringify(data).match(/(?<="result":)\w{4}(?=})/g)) == "true") {
                  console.log(matched[i]+'已拉黑');
                } else {
                  console.log(matched[i]+'拉黑失败');
                }
              },
              error: function(){console.log(matched[i]+'失败了')},
              complete: function() {
                if(i == matched.length - 1){console.log('完成啦')}
              }
            })
          }, i*getRandomInt(2000,3000)
        );
      })(i)
    }
  }
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
newURL = document.location.href;
usr_cookies_id = String(document.cookie.match(regex_cookie));



(function() {
  if (document.location.href.match(/(?<=people\/).+rev_contacts/g) != null) {
    next();
  } else {
    console.log("请稍后，正在跳转到关注列表...");
    window.location.replace(document.location.href.concat("", "/rev_contacts"))
  }
})()



