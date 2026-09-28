/**
 * طائرة المقاتلة النفاثة الذكية - كود التفاعل ونموذج الطلب
 * مخصص للسوق المصري مع حساب الشحن والربط بواتساب (+201125611779)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- إعدادات وثوابت التسعير والواتساب ---
  const WHATSAPP_NUMBER = "201125611779";
  const BASE_PRICE = 725;
  const CAIRO_SHIPPING = 100;
  const OUTSIDE_CAIRO_SHIPPING = 150;

  // باقات العروض
  const BUNDLES = {
    1: { qty: 1, price: 725, originalPrice: 1050, title: "طائرة واحدة (725 ج.م)", discountText: "خصم 31%" },
    2: { qty: 2, price: 1350, originalPrice: 2100, title: "طائرتين - عرض التوفير (1350 ج.م)", discountText: "وفر 100 ج.م إضافية 🔥" },
    3: { qty: 3, price: 1950, originalPrice: 3150, title: "3 طائرات - عرض العائلة (1950 ج.م)", discountText: "وفر 225 ج.م إضافية 🚀" }
  };

  // حالة الطلب الحالية
  let currentQty = 1;
  let currentSubtotal = BUNDLES[1].price;
  let currentShipping = 0;
  let currentGovernorate = "";

  // --- عناصر DOM ---
  const form = document.getElementById('checkout-form');
  const govSelect = document.getElementById('governorate-select');
  const bundleOptions = document.querySelectorAll('.bundle-card');
  const subtotalDisplay = document.getElementById('summary-subtotal');
  const shippingDisplay = document.getElementById('summary-shipping');
  const totalDisplay = document.getElementById('summary-total');
  const qtyInput = document.getElementById('quantity-input');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const successModal = document.getElementById('success-modal');
  const modalWhatsappLink = document.getElementById('modal-whatsapp-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // --- تحديث الحسابات والأسعار ---
  function updateOrderCalculations() {
    // 1. تحديد سعر المنتج بحسب الكمية والباقة
    if (BUNDLES[currentQty]) {
      currentSubtotal = BUNDLES[currentQty].price;
    } else {
      currentSubtotal = currentQty * BASE_PRICE;
    }

    // 2. تحديد سعر الشحن بحسب المحافظة المختارة
    const govValue = govSelect ? govSelect.value.trim() : "";
    currentGovernorate = govValue;

    if (!govValue) {
      currentShipping = 0;
      if (shippingDisplay) shippingDisplay.textContent = "اختر المحافظة";
    } else if (govValue === "القاهرة" || govValue === "الجيزة") {
      currentShipping = CAIRO_SHIPPING;
      if (shippingDisplay) shippingDisplay.textContent = `${CAIRO_SHIPPING} ج.م (القاهرة والجيزة)`;
    } else {
      currentShipping = OUTSIDE_CAIRO_SHIPPING;
      if (shippingDisplay) shippingDisplay.textContent = `${OUTSIDE_CAIRO_SHIPPING} ج.م (شحن سريع)`;
    }

    // 3. الإجمالي النهائي
    const total = currentSubtotal + currentShipping;

    if (subtotalDisplay) subtotalDisplay.textContent = `${currentSubtotal.toLocaleString('ar-EG')} ج.م`;
    if (totalDisplay) totalDisplay.textContent = `${total.toLocaleString('ar-EG')} ج.م`;

    // تحديث الأرقام المعروضة بالأرقام القياسية
    document.querySelectorAll('.live-calc-total').forEach(el => {
      el.textContent = `${total} ج.م`;
    });
  }

  // معالجة اختيار الباقات (1, 2, 3 قطع)
  bundleOptions.forEach(card => {
    card.addEventListener('click', () => {
      bundleOptions.forEach(c => c.classList.remove('active', 'border-sky-500', 'bg-sky-950/40'));
      card.classList.add('active', 'border-sky-500', 'bg-sky-950/40');
      
      const qty = parseInt(card.dataset.qty, 10);
      currentQty = qty;
      if (qtyInput) qtyInput.value = currentQty;
      updateOrderCalculations();
    });
  });

  // التحكم بالكمية (+ و -)
  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      currentQty++;
      if (qtyInput) qtyInput.value = currentQty;
      syncBundleSelection(currentQty);
      updateOrderCalculations();
    });
  }

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        if (qtyInput) qtyInput.value = currentQty;
        syncBundleSelection(currentQty);
        updateOrderCalculations();
      }
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      currentQty = val;
      qtyInput.value = currentQty;
      syncBundleSelection(currentQty);
      updateOrderCalculations();
    });
  }

  function syncBundleSelection(qty) {
    bundleOptions.forEach(c => {
      if (parseInt(c.dataset.qty, 10) === qty) {
        c.classList.add('active', 'border-sky-500', 'bg-sky-950/40');
      } else {
        c.classList.remove('active', 'border-sky-500', 'bg-sky-950/40');
      }
    });
  }

  // تغيير المحافظة
  if (govSelect) {
    govSelect.addEventListener('change', updateOrderCalculations);
  }

  // الحساب المبدئي
  updateOrderCalculations();

  // --- بناء نص رسالة الواتساب الاحترافية ---
  function generateWhatsAppMessage(orderData) {
    return `🛒 *طلب جديد من الموقع الرسمي - طائرة التحكم عن بعد* 🚀
━━━━━━━━━━━━━━━━━━
👤 *الاسم:* ${orderData.name}
📞 *رقم الهاتف الأساسي:* ${orderData.phone}
📱 *رقم إضافي / واتساب:* ${orderData.altPhone || 'لا يوجد'}
📍 *المحافظة:* ${orderData.governorate}
🏠 *العنوان بالتفصيل:* ${orderData.address}
📦 *تفاصيل الطلب:* ${orderData.qty} طائرة نفاثة Aerial Fighter
💵 *سعر اللعبة:* ${orderData.subtotal} ج.م
🚚 *مصاريف الشحن:* ${orderData.shipping} ج.م
💰 *الإجمالي المطلوب عند الاستلام:* ${orderData.total} ج.م
━━━━━━━━━━━━━━━━━━
🤝 *طريقة الدفع:* الدفع عند الاستلام بعد المعاينة والتجربة
⏰ *وقت الطلب:* ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`;
  }

  // --- إرسال النموذج ومعالجة الطلب ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('customer-name').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const altPhone = document.getElementById('customer-alt-phone') ? document.getElementById('customer-alt-phone').value.trim() : "";
      const governorate = govSelect ? govSelect.value.trim() : "";
      const address = document.getElementById('customer-address').value.trim();

      // التحقق من الحقول
      if (!name) {
        alert("يرجى كتابة الاسم بالكامل.");
        document.getElementById('customer-name').focus();
        return;
      }

      // التحقق من صحة رقم الموبايل المصري
      const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
      const cleanedPhone = phone.replace(/[\s-]/g, '');
      if (!egyptianPhoneRegex.test(cleanedPhone)) {
        alert("يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم (يبدأ بـ 010 أو 011 أو 012 أو 015)");
        document.getElementById('customer-phone').focus();
        return;
      }

      if (!governorate) {
        alert("يرجى اختيار المحافظة لتحديد مصاريف الشحن والإجمالي بدقة.");
        govSelect.focus();
        return;
      }

      if (!address || address.length < 5) {
        alert("يرجى كتابة العنوان بالتفصيل (اسم الشارع، رقم العمارة، علامة مميزة) لتسليم سريع.");
        document.getElementById('customer-address').focus();
        return;
      }

      const total = currentSubtotal + currentShipping;

      const orderData = {
        name,
        phone: cleanedPhone,
        altPhone,
        governorate,
        address,
        qty: currentQty,
        subtotal: currentSubtotal,
        shipping: currentShipping,
        total
      };

      // رسالة الواتساب
      const waMsg = generateWhatsAppMessage(orderData);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

      // حفظ نسخة محلياً في المتصفح لضمان عدم ضياع أي طلب
      try {
        const storedOrders = JSON.parse(localStorage.getItem('my_plane_orders') || '[]');
        storedOrders.push({ ...orderData, timestamp: new Date().toISOString() });
        localStorage.setItem('my_plane_orders', JSON.stringify(storedOrders));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      // تشغيل تأثير الاحتفال (Confetti)
      triggerConfetti();

      // تجهيز النافذة المنبثقة
      if (modalWhatsappLink) {
        modalWhatsappLink.href = waUrl;
      }

      const modalDetails = document.getElementById('modal-order-summary');
      if (modalDetails) {
        modalDetails.innerHTML = `
          <div class="bg-slate-800/80 p-4 rounded-xl text-sm border border-slate-700 space-y-2 text-right">
            <p><strong class="text-sky-400">العميل:</strong> ${name}</p>
            <p><strong class="text-sky-400">الهاتف:</strong> ${cleanedPhone}</p>
            <p><strong class="text-sky-400">العنوان:</strong> ${governorate} - ${address}</p>
            <p><strong class="text-sky-400">الكمية:</strong> ${currentQty} طائرة</p>
            <p class="text-lg font-bold text-amber-400 pt-2 border-t border-slate-700">
              المبلغ الإجمالي عند الاستلام: ${total} ج.م (شامل الشحن)
            </p>
          </div>
        `;
      }

      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
      }

      // فتح محادثة الواتساب تلقائياً بعد ثانية ونصف لضمان إرسال الرسالة إلى هاتفك
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1200);
    });
  }

  // إغلاق النافذة المنبثقة
  if (modalCloseBtn && successModal) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.add('hidden');
      successModal.classList.remove('flex');
    });
  }

  // --- زر الطلب السريع المباشر عبر واتساب في النموذج ---
  const directWaBtn = document.getElementById('direct-wa-btn');
  if (directWaBtn) {
    directWaBtn.addEventListener('click', () => {
      const name = document.getElementById('customer-name').value.trim() || "عميل مهتم";
      const phone = document.getElementById('customer-phone').value.trim() || "غير مسجل";
      const gov = govSelect ? govSelect.value.trim() : "غير محدد";
      const total = currentSubtotal + currentShipping;

      const quickMsg = `مرحباً، أود الاستفسار وطلب طائرة التحكم عن بعد النفاثة (Aerial Fighter) ✈️
الكمية: ${currentQty}
المحافظة: ${gov || 'أرجو تحديد الشحن'}
الإجمالي التقريبي: ${total} ج.م`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quickMsg)}`, '_blank');
    });
  }

  // --- معرض الصور التفاعلي (Image Gallery Switcher) ---
  const mainImage = document.getElementById('main-gallery-image');
  const thumbs = document.querySelectorAll('.thumb-item');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active', 'border-sky-400'));
      thumb.classList.add('active', 'border-sky-400');
      
      const newSrc = thumb.dataset.fullSrc;
      if (mainImage && newSrc) {
        mainImage.style.opacity = '0.3';
        mainImage.style.transform = 'scale(0.96)';
        setTimeout(() => {
          mainImage.src = newSrc;
          mainImage.style.opacity = '1';
          mainImage.style.transform = 'scale(1)';
        }, 150);
      }
    });
  });

  // --- العداد التنازلي للعرض الحصري ---
  function startCountdown() {
    const hoursEl = document.getElementById('timer-hours');
    const minsEl = document.getElementById('timer-minutes');
    const secsEl = document.getElementById('timer-seconds');
    if (!hoursEl || !minsEl || !secsEl) return;

    let totalSeconds = 3 * 3600 + 47 * 60 + 28; // 3 hours 47 mins

    setInterval(() => {
      if (totalSeconds <= 0) totalSeconds = 4 * 3600;
      totalSeconds--;

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minsEl.textContent = String(m).padStart(2, '0');
      secsEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }
  startCountdown();

  // --- إشعارات المبيعات الحية (Social Proof Toasts) ---
  const liveToast = document.getElementById('live-toast');
  const toastCustomer = document.getElementById('toast-customer');
  const toastLocation = document.getElementById('toast-location');
  const toastTime = document.getElementById('toast-time');

  const buyers = [
    { name: "محمود ع.", city: "القاهرة (مدينة نصر)", time: "منذ دقيقتين", qty: "طائرتين" },
    { name: "أحمد س.", city: "الجيزة (الدقي)", time: "منذ 4 دقائق", qty: "طائرة واحدة" },
    { name: "طارق ك.", city: "الإسكندرية (سموحة)", time: "منذ 6 دقائق", qty: "طائرتين" },
    { name: "د. هاني", city: "المنصورة", time: "منذ 8 دقائق", qty: "3 طائرات (هدية لأبنائه)" },
    { name: "إسلام ف.", city: "طنطا", time: "منذ 11 دقيقة", qty: "طائرة واحدة" },
    { name: "عمرو ن.", city: "القاهرة (التجمع الخامس)", time: "منذ 14 دقيقة", qty: "طائرتين" }
  ];

  let buyerIndex = 0;
  function showNextLiveToast() {
    if (!liveToast || !toastCustomer) return;
    const buyer = buyers[buyerIndex];
    toastCustomer.textContent = `${buyer.name} طلب ${buyer.qty}`;
    toastLocation.textContent = `📍 ${buyer.city}`;
    toastTime.textContent = buyer.time;

    liveToast.classList.add('show');

    setTimeout(() => {
      liveToast.classList.remove('show');
    }, 4500);

    buyerIndex = (buyerIndex + 1) % buyers.length;
  }

  // تشغيل أول إشعار بعد 5 ثوانٍ، ثم كل 18 ثانية
  setTimeout(() => {
    showNextLiveToast();
    setInterval(showNextLiveToast, 18000);
  }, 5000);

  // --- الأكورديون للأسئلة الشائعة (FAQ Accordion) ---
  const faqButtons = document.querySelectorAll('.faq-toggle');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      const isOpen = !content.classList.contains('hidden');

      // إغلاق باقي الأسئلة
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  // --- تأثير الاحتفال الخفيف بالـ Canvas ---
  function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#0ea5e9', '#38bdf8', '#f59e0b', '#10b981', '#ffffff', '#ec4899'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: Math.random() * 6 + 3,
        dx: (Math.random() - 0.5) * 16,
        dy: (Math.random() - 0.7) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0,
        opacity: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.opacity <= 0) return;
        activeCount++;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.35; // الجاذبية
        p.tiltAngle += p.tiltAngleInc;
        p.opacity -= 0.012;

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      });

      if (activeCount > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        canvas.remove();
      }
    }
    render();
  }
});
