var request = require('postman-request');
var apiSecenekleri = {
    sunucu: "http://localhost:3000",
    apiYolu: '/api/mekanlar/'
}

var istekSecenekleri;
var footer = "Hüseyin Özcan 2020";

var mesafeyiFormatla = function (mesafe) {
    //Arayüzde mesafe daha güzel görünmesi için basit bir kod.
    var yeniMesafe, birim;
    if (mesafe > 1000) {
        yeniMesafe = parseFloat(mesafe / 1000).toFixed(1);
        birim = ' km';
    } else {
        yeniMesafe = parseFloat(mesafe).toFixed(1);
    }
    return yeniMesafe + birim;
}

var anaSayfaOlustur = function (req, res, cevap, mekanListesi) {
    //Bu fonk. arayüze yüklenecek mekanları api aracılığı ile DB'den çekip render eder.
    var mesaj;

    if (!(mekanListesi instanceof Array)) {
        mesaj = "API HATASI: Bir şeyler ters gitti";
        mekanListesi = [];
    } else {
        if (!mekanListesi.length) {
            mesaj = "Civarda mekan bulunamadı!";
        }
    }
    res.render('mekanlar-liste', {
        baslik: "Mekan32",
        sayfaBaslik: {
            siteAd: 'Mekan32',
            aciklama: 'Isparta Civarındaki Mekanları Keşfedin!'
        },
        mekanlar: mekanListesi,
        mesaj: mesaj,
        cevap: cevap
    });
}

const anaSayfa = function (req, res, next) {
    istekSecenekleri =
    {
        url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu,
        method: "GET",
        json: {},
        qs: {
            enlem: req.query.enlem,
            boylam: req.query.boylam
        }
    };
    request(
        istekSecenekleri,
        function (hata, cevap, mekanlar) {
            var i, gelenMekanlar;
            gelenMekanlar = mekanlar;

            if (!hata && gelenMekanlar.length) {
                for (i = 0; i < gelenMekanlar.length; i++) {
                    gelenMekanlar[i].mesafe = mesafeyiFormatla(gelenMekanlar[i].mesafe);
                }
            }
            anaSayfaOlustur(req, res, cevap, gelenMekanlar);
        }
    );
}

var detaySayfasiOlustur = function (req, res, mekanDetaylari) {
    res.render('mekan-detay',
        {
            baslik: mekanDetaylari.ad,
            sayfaBaslik: mekanDetaylari.ad,
            mekanBilgisi: mekanDetaylari
        });
}


var detaySayfasiOlustur = function (req, res, mekanDetaylari) {
    res.render('mekan-detay', {
        baslik: mekanDetaylari.ad,
        footer: footer,
        sayfaBaslik: mekanDetaylari.ad,
        mekanBilgisi: mekanDetaylari
    });
}

const yorumEkle = function (req, res, next) {
    res.render('yorum-ekle', {
        title: 'Yorum Ekle',
        'footer': 'Anıl Erdem Ateş 2020',
    });
}

var hataGoster = function (req, res, durum) {
    var baslik, icerik;
    console.log("----[TEST]---- HataGoster")
    if (durum == 404) {
        console.log("----[TEST]---- 404")
        baslik = "404, Sayfa Bulunamadı!";
        icerik = "Kusura bakmayın, sayfayı bulamadık!";
    } else {
        console.log("----[TEST]---- Başka bir hata")
        baslik = durum + ", Bir şeyler ters gitti!";
        icerik = "Ters giden bir şey var!";
    }

    console.log("----[TEST]---- Baslik: " + baslik + " İcerik: " + icerik)
    res.status(durum);
    res.render('hata', {
        baslik: baslik,
        icerik: icerik
    });
}

var mekanBilgisi = function (req, res, callback) {
    istekSecenekleri = {
        url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu + req.params.mekanid,
        method: "GET",
        json: {}
    };

    console.log("URL: " + istekSecenekleri.url);

    request(
        istekSecenekleri,
        function (hata, cevap, mekanDetaylari) {
            var gelenMekan = mekanDetaylari;
            if (cevap.statusCode == 200) {
                gelenMekan.koordinatlar = {
                    enlem: mekanDetaylari.koordinatlar[0],
                    boylam: mekanDetaylari.koordinatlar[1]
                };
                detaySayfasiOlustur(req, res, gelenMekan);
            } else {
                console.log("----[TEST]---- mekanbilgisi yüklenemedi")
                hataGoster(req, res, cevap.statusCode);
            }
        }
    )
}

module.exports = {
    anaSayfa,
    mekanBilgisi,
    yorumEkle,
    hataGoster
} 