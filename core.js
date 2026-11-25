(function (root) {
  var M = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  var F = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر'];
  var TM = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  var H = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  function below100(n, fem) {
    var U = fem ? F : M;
    if (n === 0) return '';
    if (n <= 10) return U[n];
    if (n === 11) return fem ? 'إحدى عشرة' : 'أحد عشر';
    if (n === 12) return fem ? 'اثنتا عشرة' : 'اثنا عشر';
    if (n < 20) return U[n - 10] + ' ' + (fem ? 'عشرة' : 'عشر');
    var u = n % 10, t = Math.floor(n / 10);
    return (u ? U[u] + ' و' : '') + TM[t];
  }
  function below1000(n, fem) {
    var h = Math.floor(n / 100), r = n % 100, parts = [];
    if (h) parts.push(H[h]);
    if (r) parts.push(below100(r, fem));
    return parts.join(' و');
  }
  var SCALES = [
    null,
    { s: 'ألف', d: 'ألفان', p: 'آلاف' },
    { s: 'مليون', d: 'مليونان', p: 'ملايين' },
    { s: 'مليار', d: 'ملياران', p: 'مليارات' },
    { s: 'تريليون', d: 'تريليونان', p: 'تريليونات' }
  ];
  function intToWords(n, fem) {
    n = BigInt(n);
    if (n === 0n) return 'صفر';
    var groups = [];
    while (n > 0n) { groups.push(Number(n % 1000n)); n = n / 1000n; }
    if (groups.length > SCALES.length) throw new Error('too big');
    var out = [];
    for (var i = groups.length - 1; i >= 0; i--) {
      var g = groups[i];
      if (!g) continue;
      if (i === 0) { out.push(below1000(g, fem)); continue; }
      var sc = SCALES[i], w;
      if (g === 1) w = sc.s;
      else if (g === 2) w = sc.d;
      else if (g <= 10) w = M[g] + ' ' + sc.p;
      else {
        var gw = below1000(g, false), r = g % 100;
        if (/مائتان$/.test(gw)) gw = gw.replace(/مائتان$/, 'مائتا');
        w = gw + ' ' + (r >= 3 && r <= 10 ? sc.p : (r >= 11 ? sc.s + 'اً' : sc.s));
      }
      out.push(w);
    }
    return out.join(' و');
  }
  var CUR = {
    EGP: { m: ['جنيه', 'جنيهان', 'جنيهات', 'جنيهاً'], mf: false, s: ['قرش', 'قرشان', 'قروش', 'قرشاً'], sf: false, sub: 100, adj: 'مصري' },
    USD: { m: ['دولار', 'دولاران', 'دولارات', 'دولاراً'], mf: false, s: ['سنت', 'سنتان', 'سنتات', 'سنتاً'], sf: false, sub: 100, adj: 'أمريكي' },
    SAR: { m: ['ريال', 'ريالان', 'ريالات', 'ريالاً'], mf: false, s: ['هللة', 'هللتان', 'هللات', 'هللة'], sf: true, sub: 100, adj: 'سعودي' },
    AED: { m: ['درهم', 'درهمان', 'دراهم', 'درهماً'], mf: false, s: ['فلس', 'فلسان', 'فلوس', 'فلساً'], sf: false, sub: 100, adj: 'إماراتي' },
    KWD: { m: ['دينار', 'ديناران', 'دنانير', 'ديناراً'], mf: false, s: ['فلس', 'فلسان', 'فلوس', 'فلساً'], sf: false, sub: 1000, adj: 'كويتي' },
    EUR: { m: ['يورو', 'يورو', 'يورو', 'يورو'], mf: false, s: ['سنت', 'سنتان', 'سنتات', 'سنتاً'], sf: false, sub: 100, adj: '' }
  };
  function counted(n, forms, fem) {
    n = BigInt(n);
    if (n === 0n) return '';
    if (n === 1n) return forms[0] + (forms[0] === forms[1] ? '' : (fem ? ' واحدة' : ' واحد'));
    if (n === 2n) return forms[1] + (forms[0] === forms[1] ? '' : (fem ? ' اثنتان' : ' اثنان'));
    var r = Number(n % 100n), f;
    if (r === 1 || r === 2) {
      var head = intToWords(n - BigInt(r), false);
      return head + ' و' + counted(r, forms, fem);
    }
    var words = intToWords(n, fem);
    if (r >= 3 && r <= 10) f = forms[2]; else if (r >= 11) f = forms[3]; else { f = forms[0]; words = words.replace(/اً$/, ''); }
    return words + ' ' + f;
  }
  function toArabicWords(input, code, opts) {
    opts = opts || {};
    var cur = CUR[code];
    var s = String(input).trim()
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776; })
      .replace(/[٬,\s]/g, '').replace('٫', '.');
    if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('bad number');
    var parts = s.split('.'), whole = BigInt(parts[0]);
    var digits = String(cur.sub).length - 1;
    var frac = (parts[1] || '').padEnd(digits, '0').slice(0, digits);
    var sub = BigInt(frac || '0');
    var a = counted(whole, cur.m, cur.mf);
    if (a && cur.adj) {
      var rr = Number(whole % 100n), suf = whole === 1n ? '' : whole === 2n ? 'ان' : (rr >= 3 && rr <= 10) ? 'ة' : rr >= 11 ? 'اً' : '';
      if (rr === 1 || rr === 2) suf = rr === 1 ? '' : 'ان';
      a += ' ' + cur.adj + suf;
    }
    var b = counted(sub, cur.s, cur.sf);
    var text;
    if (!a && !b) text = 'صفر ' + cur.m[0];
    else text = [a, b].filter(Boolean).join(' و');
    if (opts.cheque !== false) text = 'فقط ' + text + ' لا غير';
    return text;
  }
  var api = { intToWords: intToWords, toArabicWords: toArabicWords, CUR: CUR };
  if (typeof module !== 'undefined') module.exports = api; else root.Tafqit = api;
})(this);
