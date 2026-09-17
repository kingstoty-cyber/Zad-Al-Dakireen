/* تحميل الأذكار المعروضة من ملف حصن المسلم الموثق فقط. */
(function () {
  'use strict';

  const ordinal = new Intl.NumberFormat('ar');
  const repeatLabel = count => `${ordinal.format(count)} ${count === 1 ? 'مرة' : 'مرات'}`;

  window.VerifiedAdhkarReady = fetch('./verified-adhkar.json')
    .then(response => {
      if (!response.ok) throw new Error('تعذر تحميل ملف الأذكار الموثقة');
      return response.json();
    })
    .then(payload => {
      const entries = Array.isArray(payload.entries) ? payload.entries : [];
      if (!entries.length) throw new Error('ملف الأذكار الموثقة فارغ');

      // لا نعرض قاعدة الأذكار القديمة؛ جميع ما يظهر للمستخدم يأتي من الملف الموثق.
      Object.keys(AdhkarDB).forEach(key => delete AdhkarDB[key]);
      AdhkarDB.daily = [];
      AdhkarDB.hisn = [];

      entries.forEach((entry, index) => {
        const item = {
          id: 100000 + index,
          text: entry.text,
          count: Number.isInteger(entry.repeats) && entry.repeats > 0 ? entry.repeats : 1,
          reference: entry.source,
          times: repeatLabel(Number.isInteger(entry.repeats) && entry.repeats > 0 ? entry.repeats : 1),
          benefit: entry.benefit || '',
          section: entry.section || entry.title || 'أذكار موثقة'
        };
        (entry.category === 'daily' ? AdhkarDB.daily : AdhkarDB.hisn).push(item);
      });

      window.VerifiedAdhkarMeta = {
        count: entries.length,
        sourceNote: payload.source_note || 'حصن المسلم'
      };
      return window.VerifiedAdhkarMeta;
    })
    .catch(error => {
      console.error('Verified adhkar:', error);
      // لا نعيد إظهار محتوى غير موثق عند تعذر الملف.
      Object.keys(AdhkarDB).forEach(key => delete AdhkarDB[key]);
      AdhkarDB.daily = [];
      AdhkarDB.hisn = [];
      return { count: 0, error: error.message };
    });
}());
