var fs = require('fs');
var plist = './platforms/ios/weQuote/weQuote-Info.plist';
fs.exists(plist, function (exists) {
    if (exists) {
        var p = fs.readFileSync(plist, 'utf8');
        p = p.replace(
            /<key>(UISupportedInterfaceOrientations(\~ipad)*)<\/key>[\r\n ]*<array>[\s\S]*?(?=<\/array>)/ig,
            "<key>$1</key>\n\t<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t"
        );
        fs.writeFileSync(plist, p, "utf8");
    }
});
