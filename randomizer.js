module.exports = {
    raceFlags: function (dx) {
        let a = (Math.floor(Math.random() * 3839) + 256).toString(16).toUpperCase();
        let b = Date.now().toString(16).toUpperCase().substr(-5,5);
        const seed = a.concat(b);
        const addDX = dx ? '+dx' : '';
        return 'http://sml2r.download/?s=' + seed + '&f=lbDceupBgixsfmMh' + addDX;
    },
    hardFlags: function () {
        let a = (Math.floor(Math.random() * 3839) + 256).toString(16).toUpperCase();
        let b = Date.now().toString(16).toUpperCase().substr(-5,5);
        const seed = a.concat(b);
        return 'http://sml2r.download/?s=' + seed + '&f=lbdceupBgixsFmMho';
    }
}