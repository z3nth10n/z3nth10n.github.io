function getLangArr() {
    var arr = [
            {% for lng in site.data.languages %}
               "{{ lng[0] }}",
            {% endfor %}
        ];
    
    return arr;
}

function redirectLangIfNeed() {
    // Set lang url    
    var curLang = Cookies.get("lang");    
        
    if(curLang && !Enumerable.from(window.location.href.split("/")).any(p => p == curLang)) {
        if(curLang == "en" && getLocationLang().count() == 0)
            return;
        
        doLangDirect(curLang);
    }
}

function doLangDirect(lang) {
    if(lang == "")
        lang = "en";
    
    var url = window.location.protocol + "//" + window.location.host + "/" + lang + "/" + getLesserLangUrl();
    
    // console.log(url);
    window.location.href = url;
}

function getLesserLangUrl() {
    var langs = getLocationLang(),
        curLang = "";
    
    if(langs.count() >= 1)
        curLang = langs.first() + "/";
    
    return window.location.href.replace(window.location.protocol + "//" + window.location.host + "/" + curLang, "");
}

function getLocationLang() {
    return Enumerable.from(window.location.href.split("/")).where(p => getLangArr().includes(p));
}