function redirectLang(relUrl) {
    var langArr = ["en", "es"]; // TODO: 0 Scalibity
    var langs = Enumerable.from(window.location.href.split("/")).where(p => langArr.includes(p));
    
    console.log(langs.count());
    
    if(langs.count() == 0)
    {
        var url = window.location.protocol + "//" + window.location.host + "/en/" + relUrl;
        
        console.log(url);
        // window.location.href = url;
    }
}