/**
 * سكربت تفاعلي خفيف وسريع جداً (Clean & Fast)
 * حساب الشحن التلقائي + الربط بواتساب (01125611779)
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = "201125611779";
  const BASE_PRICE = 775;
  const CAIRO_SHIPPING = 100;
  const OUTSIDE_CAIRO_SHIPPING = 150;

  const BUNDLES = {
    1: { qty: 1, price: 775, title: "طائرة واحدة (775 ج.م)" },
    2: { qty: 2, price: 1450, title: "طائرتين - عرض التوفير (1450 ج.م)" },
    3: { qty: 3, price: 2100, title: "3 طائرات - عرض العائلة (2100 ج.م)" }
  };

  let currentQty = 1;
  let currentSubtotal = BUNDLES[1].price;
  let currentShipping = 0;

  const form = document.getElementById('checkout-form');
  const govSelect = document.getElementById('governorate-select');
  const bundleCards = document.querySelectorAll('.bundle-select-card');
  const subtotalDisplay = document.getElementById('summary-subtotal');
  const shippingDisplay = document.getElementById('summary-shipping');
  const totalDisplay = document.getElementById('summary-total');
  const successModal = document.getElementById('success-modal');
  const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // تحديث الحسابات
  function updateCalculations() {
    if (BUNDLES[currentQty]) {
      currentSubtotal = BUNDLES[currentQty].price;
    } else {
      currentSubtotal = currentQty * BASE_PRICE;
    }

    const gov = govSelect ? govSelect.value.trim() : "";
    if (!gov) {
      currentShipping = 0;
      if (shippingDisplay) shippingDisplay.textContent = "اختر المحافظة لمعرفة الشحن";
    } else if (gov === "القاهرة" || gov === "الجيزة") {
      currentShipping = CAIRO_SHIPPING;
      if (shippingDisplay) shippingDisplay.textContent = `${CAIRO_SHIPPING} ج.م (القاهرة والجيزة)`;
    } else {
      currentShipping = OUTSIDE_CAIRO_SHIPPING;
      if (shippingDisplay) shippingDisplay.textContent = `${OUTSIDE_CAIRO_SHIPPING} ج.م (باقي المحافظات)`;
    }

    const total = currentSubtotal + currentShipping;

    if (subtotalDisplay) subtotalDisplay.textContent = `${currentSubtotal.toLocaleString('ar-EG')} ج.م`;
    if (totalDisplay) totalDisplay.textContent = `${total.toLocaleString('ar-EG')} ج.م`;
  }

  // اختيار الباقة
  bundleCards.forEach(card => {
    card.addEventListener('click', () => {
      bundleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      currentQty = parseInt(card.dataset.qty, 10) || 1;
      updateCalculations();
    });
  });

  if (govSelect) {
    govSelect.addEventListener('change', updateCalculations);
  }

  updateCalculations();

  // معرض الصور البسيط والسريع
  const mainImg = document.getElementById('main-product-img');
  const thumbs = document.querySelectorAll('.gallery-thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.dataset.src;
      if (mainImg && src) {
        mainImg.src = src;
      }
    });
  });

  // نموذج الطلب
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('customer-name').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const altPhone = document.getElementById('customer-alt-phone') ? document.getElementById('customer-alt-phone').value.trim() : "";
      const gov = govSelect ? govSelect.value.trim() : "";
      const address = document.getElementById('customer-address').value.trim();

      if (!name) {
        alert("يرجى كتابة الاسم");
        document.getElementById('customer-name').focus();
        return;
      }

      const phoneRegex = /^01[0125][0-9]{8}$/;
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        alert("يرجى إدخال رقم موبايل صحيح (مثال: 01012345678)");
        document.getElementById('customer-phone').focus();
        return;
      }

      if (!gov) {
        alert("يرجى اختيار المحافظة لتحديد مصاريف الشحن");
        govSelect.focus();
        return;
      }

      if (!address || address.length < 5) {
        alert("يرجى كتابة العنوان بالتفصيل لسهولة توصيل المندوب");
        document.getElementById('customer-address').focus();
        return;
      }

      const total = currentSubtotal + currentShipping;

      // نص رسالة الواتساب البسيط والواضح
      const waMessage = `🛒 *طلب جديد من الموقع - طائرة أطفال مقاتلة* ✈️
━━━━━━━━━━━━━━━━━━
👤 *الاسم:* ${name}
📞 *رقم الموبايل:* ${cleanPhone}
📱 *رقم بديل:* ${altPhone || 'لا يوجد'}
📍 *المحافظة:* ${gov}
🏠 *العنوان:* ${address}
📦 *الكمية:* ${currentQty} طائرة
💵 *سعر المنتج:* ${currentSubtotal} ج.م
🚚 *الشحن:* ${currentShipping} ج.م
💰 *المطلوب عند الاستلام:* ${total} ج.م
━━━━━━━━━━━━━━━━━━
🤝 طريقة الدفع: عند الاستلام بعد المعاينة`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

      // إظهار نافذة التأكيد
      const summaryContainer = document.getElementById('modal-summary-content');
      if (summaryContainer) {
        summaryContainer.innerHTML = `
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs sm:text-sm space-y-1.5 text-right">
            <p><span class="text-slate-500">الاسم:</span> <strong>${name}</strong></p>
            <p><span class="text-slate-500">الموبايل:</span> <strong>${cleanPhone}</strong></p>
            <p><span class="text-slate-500">المحافظة:</span> <strong>${gov}</strong></p>
            <p><span class="text-slate-500">العنوان:</span> <strong>${address}</strong></p>
            <p><span class="text-slate-500">الكمية:</span> <strong>${currentQty} طائرة</strong></p>
            <p class="pt-2 border-t border-slate-200 text-base font-bold text-blue-700">
              المطلوب عند الاستلام: ${total} ج.م (شامل الشحن)
            </p>
          </div>
        `;
      }

      if (modalWhatsappBtn) {
        modalWhatsappBtn.href = waUrl;
      }

      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
      }

      // توجيه تلقائي للواتساب بعد ثانية
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    });
  }

  // إغلاق النافذة
  if (modalCloseBtn && successModal) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.add('hidden');
      successModal.classList.remove('flex');
    });
  }

  // الأسئلة الشائعة
  const faqToggles = document.querySelectorAll('.faq-btn');
  faqToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const arrow = btn.querySelector('.faq-arrow');
      const isHidden = panel.classList.contains('hidden');

      document.querySelectorAll('.faq-answer').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.faq-arrow').forEach(a => a.style.transform = 'rotate(0deg)');

      if (isHidden) {
        panel.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    });
  });
});
