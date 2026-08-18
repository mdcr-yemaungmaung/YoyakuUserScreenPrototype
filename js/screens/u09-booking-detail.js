(() => {
  window.YoyakuComponents = window.YoyakuComponents || {};
  const store = window.store;

  function formatMMK(amount) {
    return Number(amount || 0).toLocaleString() + ' MMK';
  }

  function formatUSD(amount) {
    const usd = Math.round((Number(amount || 0)) / 3300);
    return `(~$${usd} USD)`;
  }

  function getStatusBadge(status, isMm) {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed') {
      return {
        bg: 'bg-[#104b2b]',
        text: 'text-white',
        border: 'border-[#104b2b]',
        icon: 'check_circle',
        label: isMm ? 'အတည်ပြုပြီး (Confirmed)' : 'Confirmed',
        desc: isMm ? 'စားပွဲဝိုင်း စိုတ်ထားမှု အတည်ပြုပြီးပါပြီ။ သတ်မှတ်ချိန်အတွင်း လာရောက်နိုင်ပါသည်' : 'Table guaranteed. Please present QR pass on arrival.'
      };
    }
    if (s === 'pending') {
      return {
        bg: 'bg-amber-600',
        text: 'text-white',
        border: 'border-amber-600',
        icon: 'hourglass_top',
        label: isMm ? 'အတည်ပြုရန် စောင့်ဆိုင်းဆဲ (Pending)' : 'Pending Confirmation',
        desc: isMm ? 'ဆိုင်ဘက်မှ စားပွဲဝိုင်း အခြေအနေ စစ်ဆေးအတည်ပြုရန် စောင့်ဆိုင်းနေပါသည်' : 'Awaiting table confirmation from venue management.'
      };
    }
    if (s === 'completed') {
      return {
        bg: 'bg-[#231916]',
        text: 'text-[#e8c078]',
        border: 'border-[#e8c078]/40',
        icon: 'verified',
        label: isMm ? 'လာရောက်ပြီးမြောက်ပြီး (Completed)' : 'Completed',
        desc: isMm ? 'စားသောက်မှု ပြီးမြောက်ခဲ့ပါပြီ။ အတွေ့အကြုံအတွက် Review ရေးသားနိုင်ပါသည်' : 'Dining completed. Share your review & earn reward points.'
      };
    }
    return {
      bg: 'bg-rose-700',
      text: 'text-white',
      border: 'border-rose-700',
      icon: 'cancel',
      label: isMm ? 'ပယ်ဖျက်ထားသည် (Cancelled)' : 'Cancelled',
      desc: isMm ? 'ဤမှာယူမှုကို ပယ်ဖျက်ထားပါသည်။ စားပွဲဝိုင်း အသစ် ပြန်လည်မှာယူနိုင်ပါသည်' : 'This reservation was cancelled.'
    };
  }

  // =========================================================================
  // MAIN U-09 RENDER ROUTER
  // =========================================================================
  function renderReservationsListView(state) {
    const isMm = state.currentLanguage === 'MM';
    const reservations = state.reservations || [];
    const selectedId = state.selectedReservationId;

    // If a specific reservation is selected, render the U-09 Detail View
    if (selectedId) {
      const selectedBooking = reservations.find(b => b.id === selectedId) || reservations[0];
      if (selectedBooking) {
        return renderReservationDetailView(selectedBooking, state);
      }
    }

    // Otherwise render the Reservations Directory / List with quick switch
    return renderReservationsAllList(state);
  }

  // =========================================================================
  // U-09: RESERVATIONS LIST VIEW (With Filter & Selection)
  // =========================================================================
  function renderReservationsAllList(state) {
    const isMm = state.currentLanguage === 'MM';
    const reservations = state.reservations || [];

    const activeCount = reservations.filter(r => r.status === 'Confirmed' || r.status === 'Pending').length;
    const pastCount = reservations.filter(r => r.status === 'Completed' || r.status === 'Cancelled').length;

    return `
      <div class="space-y-8 pb-28 sm:pb-16 text-left max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-fadeIn">
        
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EADFD1] pb-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#840f16]/10 text-[#840f16] text-xs font-label font-bold mb-1">
              <span class="material-symbols-outlined text-xs">receipt_long</span>
              <span>${isMm ? 'မှာယူမှု စာမျက်နှာ (U-09)' : 'Reservations Hub (U-09)'}</span>
            </div>
            <h1 class="font-headline text-3xl font-extrabold text-[#231916]">
              ${isMm ? 'သင်၏ စားပွဲဝိုင်း မှာယူမှုများ' : 'Your Table Reservations'}
            </h1>
            <p class="font-body text-xs sm:text-sm text-[#58413f] mt-1">
              ${isMm ? 'မှာယူမှု အသေးစိတ် ကြည့်ရှုခြင်း၊ ရက်စွဲ/အချိန် ပြင်ဆင်ခြင်းနှင့် ပယ်ဖျက်ခြင်းများကို စီမံနိုင်ပါသည်' : 'Manage your dining reservations, change dates, cancel, view check-in passes, and re-book.'}
            </p>
          </div>

          <div class="flex items-center gap-2.5">
            <button
              id="u09-guest-lookup-btn"
              class="px-4 py-2.5 rounded-full border border-[#840f16] text-[#840f16] bg-white font-label text-xs font-bold hover:bg-[#840f16]/5 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">search</span>
              <span>${isMm ? 'ဧည့်သည် စိုတ်ထားမှု စစ်ဆေးရန်' : 'Guest Code Lookup'}</span>
            </button>

            <button
              id="resv-book-new-btn"
              class="btn-primary px-5 py-2.5 rounded-full font-label text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">add_circle</span>
              <span>${isMm ? 'ဝိုင်းအသစ် စိုတ်ရန်' : 'Book New Table'}</span>
            </button>
          </div>
        </div>

        <!-- SUMMARY STATS BAR -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] text-left">
            <div class="font-label text-[11px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'စုစုပေါင်း မှာယူမှု' : 'Total Bookings'}</div>
            <div class="font-headline text-2xl font-black text-[#231916] mt-1">${reservations.length}</div>
          </div>
          <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] text-left">
            <div class="font-label text-[11px] font-bold text-[#104b2b] uppercase tracking-wider">${isMm ? 'အတည်ပြုပြီး / စောင့်ဆိုင်း' : 'Active / Pending'}</div>
            <div class="font-headline text-2xl font-black text-[#104b2b] mt-1">${activeCount}</div>
          </div>
          <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] text-left">
            <div class="font-label text-[11px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'ပြီးမြောက်ခဲ့ပြီး' : 'Past Completed'}</div>
            <div class="font-headline text-2xl font-black text-[#231916] mt-1">${reservations.filter(r => r.status === 'Completed').length}</div>
          </div>
          <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] text-left">
            <div class="font-label text-[11px] font-bold text-rose-700 uppercase tracking-wider">${isMm ? 'ပယ်ဖျက်ထားမှုများ' : 'Cancelled'}</div>
            <div class="font-headline text-2xl font-black text-rose-700 mt-1">${reservations.filter(r => r.status === 'Cancelled').length}</div>
          </div>
        </div>

        <!-- RESERVATIONS LIST -->
        ${
          reservations.length === 0
            ? `
              <div class="bg-[#FBF3E2] rounded-3xl p-12 border border-[#EADFD1] text-center space-y-4 shadow-sm my-8">
                <div class="w-16 h-16 bg-[#840f16]/10 text-[#840f16] rounded-full flex items-center justify-center mx-auto">
                  <span class="material-symbols-outlined text-3xl">calendar_today</span>
                </div>
                <h3 class="font-headline text-2xl font-bold text-[#231916]">${isMm ? 'လက်ရှိတွင် မှာယူထားသော စားပွဲဝိုင်း မရှိသေးပါ' : 'No reservations found'}</h3>
                <p class="font-body text-xs sm:text-sm text-[#58413f] max-w-md mx-auto">
                  ${isMm ? 'ရန်ကုန်မြို့ရှိ နာမည်ကျော် အဆင့်မြင့် စားသောက်ဆိုင်များကို စူးစမ်းရှာဖွေပြီး စားပွဲဝိုင်း စတင်စိုတ်ယူလိုက်ပါ' : 'Discover exquisite venues across Yangon and confirm your table in seconds.'}
                </p>
                <button
                  id="resv-empty-discover-btn"
                  class="btn-primary px-8 py-3.5 rounded-full font-label text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <span>${isMm ? 'ဆိုင်များ စူးစမ်းရန်' : 'Explore Venues'}</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            `
            : `
              <div class="space-y-4">
                ${reservations
                  .map(b => {
                    const badge = getStatusBadge(b.status, isMm);
                    const amountMmk = b.totalAmountMMK || b.totalAmount || 0;
                    return `
                      <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
                        
                        <div class="flex gap-4 items-start flex-1 min-w-0">
                          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#EADFD1] shrink-0">
                            <img src="${b.restaurantImage}" alt="${b.restaurantName}" referrerpolicy="no-referrer" loading="lazy" onerror="this.onerror=null; this.src='assets/images/gilded_fork.jpg';" class="w-full h-full object-cover" />
                          </div>
                          
                          <div class="space-y-1 min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                              <span class="${badge.bg} ${badge.text} font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">${badge.icon}</span>
                                <span>${b.status}</span>
                              </span>
                              <span class="font-label text-xs font-bold text-[#58413f] bg-white/90 px-2 py-0.5 rounded-full border border-[#EADFD1]">
                                ${b.reservationNo}
                              </span>
                              ${b.seatingPreference ? `
                                <span class="font-label text-[10px] text-[#840f16] bg-[#840f16]/5 px-2 py-0.5 rounded-full border border-[#840f16]/20">
                                  ${b.seatingPreference}
                                </span>
                              ` : ''}
                            </div>

                            <h3
                              data-u09-view-detail-id="${b.id}"
                              class="font-headline text-lg sm:text-xl font-bold text-[#231916] hover:text-[#840f16] cursor-pointer transition-colors truncate"
                            >
                              ${isMm && b.restaurantNameMM ? b.restaurantNameMM : b.restaurantName}
                            </h3>

                            <p class="font-body text-xs text-[#58413f] flex items-center gap-1 truncate">
                              <span class="material-symbols-outlined text-xs text-[#840f16]">location_on</span>
                              <span>${b.location}</span>
                            </p>

                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 font-label text-xs font-bold text-[#840f16] pt-0.5">
                              <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">calendar_today</span>
                                <span>${b.date} • ${b.time}</span>
                              </span>
                              <span class="flex items-center gap-1 text-[#58413f]">
                                <span class="material-symbols-outlined text-xs">group</span>
                                <span>${b.guests} ${isMm ? 'ဦး' : 'Guests'}</span>
                              </span>
                              <span class="text-[#231916] font-bold">
                                ${formatMMK(amountMmk)} <span class="text-[11px] text-[#58413f] font-normal">${formatUSD(amountMmk)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto shrink-0 justify-end">
                          <button
                            data-u09-view-detail-id="${b.id}"
                            class="btn-primary px-4 py-2.5 rounded-full font-label text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                          >
                            <span class="material-symbols-outlined text-sm">visibility</span>
                            <span>${isMm ? 'အသေးစိတ်နှင့် ပြင်ဆင်ရန်' : 'View Details'}</span>
                          </button>

                          ${(b.status === 'Confirmed' || b.status === 'Pending') ? `
                            <button
                              data-resv-view-pass-id="${b.id}"
                              class="px-3.5 py-2.5 rounded-full bg-white border border-[#EADFD1] font-label text-xs font-semibold text-[#231916] hover:bg-[#840f16] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="QR Pass"
                            >
                              <span class="material-symbols-outlined text-sm">qr_code_2</span>
                            </button>
                          ` : ''}

                          ${b.status === 'Completed' ? `
                            <button
                              data-u09-open-review-id="${b.id}"
                              class="px-3.5 py-2.5 rounded-full bg-[#e8c078]/20 border border-[#e8c078] font-label text-xs font-bold text-[#840f16] hover:bg-[#840f16] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span class="material-symbols-outlined text-sm">rate_review</span>
                              <span>${isMm ? 'Review ရေးမည်' : 'Write Review'}</span>
                            </button>
                          ` : ''}

                          ${(b.status === 'Completed' || b.status === 'Cancelled') ? `
                            <button
                              data-u09-rebook-id="${b.id}"
                              class="px-3.5 py-2.5 rounded-full bg-white border border-[#EADFD1] font-label text-xs font-bold text-[#104b2b] hover:bg-[#104b2b] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span class="material-symbols-outlined text-sm">refresh</span>
                              <span>${isMm ? 'ပြန်စိုတ်မည်' : 'Re-book'}</span>
                            </button>
                          ` : ''}
                        </div>

                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
        }

        <!-- MODALS -->
        ${renderU09AllModals(state)}

      </div>
    `;
  }

  // =========================================================================
  // U-09: RESERVATION DETAILS, CHANGE & CANCELLATION DETAILED VIEW
  // =========================================================================
  function renderReservationDetailView(b, state) {
    const isMm = state.currentLanguage === 'MM';
    const isGuest = state.isGuestReservationView || false;
    const badge = getStatusBadge(b.status, isMm);
    const amountMmk = b.totalAmountMMK || b.totalAmount || 350000;
    const amountUsd = b.totalAmountUSD || Math.round(amountMmk / 3300);
    const isModifiable = !isGuest && (b.status === 'Confirmed' || b.status === 'Pending');
    const isCancellable = b.status === 'Confirmed' || b.status === 'Pending';
    const isCompleted = b.status === 'Completed';
    const isCancelled = b.status === 'Cancelled';

    return `
      <div class="space-y-6 pb-28 sm:pb-16 text-left max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-fadeIn">
        
        <!-- BREADCRUMBS & TOP NAV -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#EADFD1] pb-4">
          <div class="flex items-center gap-2 text-xs font-label text-[#58413f]">
            <button id="u09-back-to-list-btn" class="hover:text-[#840f16] flex items-center gap-1 font-bold cursor-pointer">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>${isMm ? 'မှာယူမှုများ အားလုံးသို့' : 'All Reservations'}</span>
            </button>
            <span>/</span>
            <span class="text-[#840f16] font-bold">${b.reservationNo}</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="font-label text-xs text-[#58413f]">${isMm ? 'ဖန်တီးချိန်:' : 'Booked on:'} ${new Date(b.createdAt || '2026-08-10').toLocaleDateString()}</span>
          </div>
        </div>

        <!-- GUEST ACCESS RESTRICTION BANNER (If accessed via U-10 Guest Lookup) -->
        ${
          isGuest
            ? `
              <div class="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-sm animate-fadeIn">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-xl">shield_person</span>
                  </div>
                  <div>
                    <div class="font-headline font-bold text-sm text-amber-900 flex items-center gap-2">
                      <span>${isMm ? 'ဧည့်သည်အဖြစ် စစ်ဆေးနေပါသည် (Guest Mode Access)' : 'Guest Mode Reservation Access'}</span>
                      <span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-label font-bold uppercase">Guest User</span>
                    </div>
                    <p class="font-body text-xs text-amber-800 mt-0.5 leading-relaxed">
                      ${
                        isMm
                          ? 'အကောင့်မဝင်ဘဲ စစ်ဆေးထားသောကြောင့် အချက်အလက် ကြည့်ရှုခြင်းနှင့် ပယ်ဖျက်ခြင်းသာ ပြုလုပ်နိုင်ပါသည်။ ရက်စွဲ/အချိန် ပြောင်းလဲလိုပါက ဆိုင်သို့ တိုက်ရိုက်ဖုန်းဆက်ပါ'
                          : 'You are viewing this reservation as a Guest. Date and time changes cannot be modified online. Please call the restaurant directly or cancel/re-book.'
                      }
                    </p>
                  </div>
                </div>

                <a
                  href="tel:${b.restaurantPhone || '+959798123456'}"
                  class="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-label text-xs font-bold shadow-xs inline-flex items-center gap-1.5 shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">call</span>
                  <span>${isMm ? 'ဆိုင်သို့ ဖုန်းခေါ်မည်' : 'Call Restaurant'}</span>
                </a>
              </div>
            `
            : ''
        }

        <!-- HERO STATUS CARD -->
        <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 sm:p-8 shadow-md relative overflow-hidden">
          
          <!-- Decorative subtle pattern background -->
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-[#840f16]/5 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            
            <!-- Left status info -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="${badge.bg} ${badge.text} font-label text-xs font-extrabold uppercase px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                  <span class="material-symbols-outlined text-sm">${badge.icon}</span>
                  <span>${badge.label}</span>
                </span>
                <span class="font-label text-xs font-bold text-[#58413f] bg-white px-3 py-1 rounded-full border border-[#EADFD1]">
                  ${b.reservationNo}
                </span>
              </div>

              <h2 class="font-headline text-2xl sm:text-3xl font-extrabold text-[#231916]">
                ${isMm && b.restaurantNameMM ? b.restaurantNameMM : b.restaurantName}
              </h2>

              <p class="font-body text-xs sm:text-sm text-[#58413f] max-w-xl">
                ${badge.desc}
              </p>
            </div>

            <!-- Primary Action Buttons Row -->
            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              
              <!-- Check-In QR Pass Button -->
              ${!isCancelled ? `
                <button
                  id="u09-view-qr-pass-btn"
                  class="btn-primary px-5 py-3 rounded-full font-label text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                >
                  <span class="material-symbols-outlined text-base">qr_code_2</span>
                  <span>${isMm ? 'QR Pass ဖွင့်ပြရန်' : 'Show Check-in Pass'}</span>
                </button>
              ` : ''}

              <!-- Change Date & Time Button ("日時を変更") -->
              ${isModifiable ? `
                <button
                  id="u09-change-datetime-btn"
                  class="px-5 py-3 rounded-full bg-white border border-[#840f16] text-[#840f16] hover:bg-[#840f16] hover:text-white transition-all font-label text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                >
                  <span class="material-symbols-outlined text-base">edit_calendar</span>
                  <span>${isMm ? '日時を変更 (ရက်စွဲ/အချိန် ပြောင်းမည်)' : 'Change Date & Time'}</span>
                </button>
              ` : ''}

              <!-- Write Review Button for Completed -->
              ${isCompleted ? `
                <button
                  id="u09-write-review-btn"
                  class="px-5 py-3 rounded-full bg-[#840f16] text-white hover:bg-[#680b11] transition-all font-label text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                >
                  <span class="material-symbols-outlined text-base">rate_review</span>
                  <span>${isMm ? '口コミを書く (Review ရေးရန်)' : 'Write Review (口コミを書く)'}</span>
                </button>
              ` : ''}

              <!-- One-Tap Re-Booking for Completed or Cancelled -->
              ${(isCompleted || isCancelled) ? `
                <button
                  id="u09-rebook-btn"
                  class="px-5 py-3 rounded-full bg-[#104b2b] text-white hover:bg-[#0c3920] transition-all font-label text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                >
                  <span class="material-symbols-outlined text-base">repeat</span>
                  <span>${isMm ? 'One-tap Re-booking (ပြန်လည်မှာယူခြင်း)' : 'One-tap Re-booking'}</span>
                </button>
              ` : ''}

              <!-- Cancel Reservation Button -->
              ${isCancellable ? `
                <button
                  id="u09-cancel-booking-btn"
                  class="px-4 py-3 rounded-full bg-[#FFF8F6] border border-rose-300 text-rose-700 hover:bg-rose-700 hover:text-white transition-colors font-label text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">cancel</span>
                  <span>${isMm ? 'မှာယူမှုကို ပယ်ဖျက်မည်' : 'Cancel Reservation'}</span>
                </button>
              ` : ''}

            </div>

          </div>

        </div>

        <!-- GRID OF DETAILS (RESTAURANT, SCHEDULE, MENU & BILLING) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- LEFT 2 COLUMNS: VENUE & SCHEDULE & MENU -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- SECTION 1: VENUE & SCHEDULE DETAILS -->
            <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 space-y-5 shadow-xs">
              <div class="flex items-center justify-between border-b border-[#EADFD1] pb-3">
                <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">restaurant</span>
                  <span>${isMm ? '၁။ ဆိုင်နှင့် ကြိုတင်မှာယူမှု အချိန်ဇယား' : '1. Venue & Schedule Details'}</span>
                </div>
                <button id="u09-view-restaurant-page-btn" class="font-label text-xs font-bold text-[#840f16] hover:underline flex items-center gap-1 cursor-pointer">
                  <span>${isMm ? 'ဆိုင်စာမျက်နှာသို့' : 'View Venue Page'}</span>
                  <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              <!-- Venue Header Card -->
              <div class="flex flex-col sm:flex-row gap-4 items-start">
                <div class="w-full sm:w-36 h-28 rounded-2xl overflow-hidden border border-[#EADFD1] shrink-0">
                  <img src="${b.restaurantImage}" alt="${b.restaurantName}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover" />
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                  <h3 class="font-headline text-xl font-bold text-[#231916]">
                    ${isMm && b.restaurantNameMM ? b.restaurantNameMM : b.restaurantName}
                  </h3>
                  <p class="font-body text-xs text-[#58413f] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#840f16]">location_on</span>
                    <span>${b.address || b.location}</span>
                  </p>
                  <p class="font-body text-xs text-[#58413f] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#840f16]">call</span>
                    <span>${b.restaurantPhone || '+95 9 798 123 456'}</span>
                  </p>
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    ${(b.seatingTags || ['Lake View', 'Window Table', 'Non-Smoking']).map(tag => `
                      <span class="px-2 py-0.5 rounded-md bg-white border border-[#EADFD1] font-label text-[10px] font-bold text-[#58413f]">
                        # ${tag}
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Schedule Grid Breakdown -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="bg-white/80 p-3.5 rounded-2xl border border-[#EADFD1] text-left">
                  <div class="font-label text-[10px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'လာရောက်မည့် ရက်စွဲ' : 'Dining Date'}</div>
                  <div class="font-headline font-bold text-sm text-[#231916] flex items-center gap-1.5 mt-1">
                    <span class="material-symbols-outlined text-sm text-[#840f16]">calendar_month</span>
                    <span>${b.date}</span>
                  </div>
                </div>

                <div class="bg-white/80 p-3.5 rounded-2xl border border-[#EADFD1] text-left">
                  <div class="font-label text-[10px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'လာရောက်မည့် အချိန်' : 'Dining Time'}</div>
                  <div class="font-headline font-bold text-sm text-[#231916] flex items-center gap-1.5 mt-1">
                    <span class="material-symbols-outlined text-sm text-[#840f16]">schedule</span>
                    <span>${b.time}</span>
                  </div>
                </div>

                <div class="bg-white/80 p-3.5 rounded-2xl border border-[#EADFD1] text-left">
                  <div class="font-label text-[10px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'ဧည့်သည် လူဦးရေ' : 'Party Size'}</div>
                  <div class="font-headline font-bold text-sm text-[#231916] flex items-center gap-1.5 mt-1">
                    <span class="material-symbols-outlined text-sm text-[#840f16]">group</span>
                    <span>${b.guests} ${isMm ? 'ဦး (Guests)' : 'Guests'}</span>
                  </div>
                </div>
              </div>

              <!-- Seating Preference & Special Requests -->
              <div class="bg-white/80 p-4 rounded-2xl border border-[#EADFD1] space-y-2 text-left">
                <div class="flex items-center justify-between">
                  <span class="font-label text-xs font-bold text-[#58413f]">${isMm ? 'ကြိုက်နှစ်သက်ရာ နေရာ (Seating Preference):' : 'Seating Preference:'}</span>
                  <span class="font-headline font-bold text-xs text-[#840f16]">${b.seatingPreference || 'Lake View Window Table'}</span>
                </div>
                ${b.specialRequests ? `
                  <div class="border-t border-[#EADFD1] pt-2">
                    <span class="font-label text-[11px] font-bold text-[#58413f] block mb-0.5">${isMm ? 'သီးသန့် တောင်းဆိုချက် (Special Requests):' : 'Special Guest Requests:'}</span>
                    <p class="font-body text-xs text-[#231916] italic bg-[#FFF8F6] p-2.5 rounded-xl border border-[#EADFD1]">
                      "${b.specialRequests}"
                    </p>
                  </div>
                ` : ''}
              </div>

            </div>

            <!-- SECTION 2: SELECTED MENU & COURSE ITEMS -->
            <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 space-y-4 shadow-xs">
              <div class="flex items-center justify-between border-b border-[#EADFD1] pb-3">
                <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">menu_book</span>
                  <span>${isMm ? '၂။ ရွေးချယ်ထားသော မီနူးနှင့် ဟင်းလျာများ' : '2. Selected Course & Menu Plan'}</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-[#840f16]/10 text-[#840f16] text-[10px] font-label font-bold">
                  ${b.guests} x Set Menu
                </span>
              </div>

              <!-- Course Title -->
              <div class="bg-white/90 p-4 rounded-2xl border border-[#EADFD1] space-y-1">
                <h4 class="font-headline font-bold text-base text-[#231916]">
                  ${isMm && b.courseNameMM ? b.courseNameMM : (b.courseName || 'Chef Premium Degustation Course')}
                </h4>
                <p class="font-body text-xs text-[#58413f]">
                  ${isMm ? 'ရာသီအလိုက် အကောင်းဆုံး ပါဝင်ပစ္စည်းများဖြင့် စီမံထားသော စားဖိုမှူးလက်ရာ ဟင်းလျာတွဲ' : 'Curated multi-course dining experience crafted by the executive chef.'}
                </p>
              </div>

              <!-- Menu Items List -->
              ${b.menuItems && b.menuItems.length > 0 ? `
                <div class="space-y-2">
                  ${b.menuItems.map((item, idx) => `
                    <div class="flex items-center justify-between bg-white/70 p-3 rounded-xl border border-[#EADFD1] text-xs">
                      <div class="flex items-center gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#840f16]/10 text-[#840f16] font-bold text-[10px] flex items-center justify-center shrink-0">
                          ${idx + 1}
                        </span>
                        <div>
                          <div class="font-headline font-bold text-[#231916]">${isMm && item.nameMM ? item.nameMM : item.name}</div>
                          ${item.qty ? `<div class="font-body text-[10px] text-[#58413f]">${isMm ? 'အရေအတွက်:' : 'Quantity:'} ${item.qty} ${isMm ? 'ပွဲ' : 'Portions'}</div>` : ''}
                        </div>
                      </div>
                      <div class="font-label font-bold text-[#840f16] text-right">
                        <div>${formatMMK(item.priceMMK)}</div>
                        <div class="text-[10px] text-[#58413f] font-normal">${formatUSD(item.priceMMK)}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-3 bg-white/60 rounded-xl border border-[#EADFD1] text-xs text-[#58413f] italic">
                  ${isMm ? 'အထူး ရွေးချယ်ထားသော စားဖိုမှူးလက်ရာ စားသောက်ပွဲ' : 'Standard à la carte & beverage reservation plan.'}
                </div>
              `}

            </div>

            <!-- SECTION 3: CHANGE & CANCELLATION RULES -->
            <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 space-y-4 shadow-xs">
              <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#EADFD1] pb-3">
                <span class="material-symbols-outlined text-sm">gavel</span>
                <span>${isMm ? '၃။ ပြင်ဆင်ခြင်းနှင့် ပယ်ဖျက်ခြင်းဆိုင်ရာ စည်းမျဉ်းများ' : '3. Change & Cancellation Policy'}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div class="bg-white/80 p-4 rounded-2xl border border-[#EADFD1] space-y-1.5">
                  <div class="font-headline font-bold text-[#231916] flex items-center gap-1 text-xs">
                    <span class="material-symbols-outlined text-sm text-[#104b2b]">check_circle</span>
                    <span>${isMm ? 'အခမဲ့ ပယ်ဖျက်နိုင်သည့် သတ်မှတ်ချိန်' : 'Free Cancellation Window'}</span>
                  </div>
                  <p class="text-[#58413f] text-[11px]">
                    ${isMm && b.cancellationPolicyMM ? b.cancellationPolicyMM : (b.cancellationPolicy || `Free cancellation up to ${b.cancelHours || 24} hours prior to reservation time.`)}
                  </p>
                </div>

                <div class="bg-white/80 p-4 rounded-2xl border border-[#EADFD1] space-y-1.5">
                  <div class="font-headline font-bold text-[#231916] flex items-center gap-1 text-xs">
                    <span class="material-symbols-outlined text-sm text-amber-600">info</span>
                    <span>${isMm ? 'ပြင်ဆင်မှု ကန့်သတ်ချက်များ' : 'Change Modification Rules'}</span>
                  </div>
                  <p class="text-[#58413f] text-[11px]">
                    ${isMm 
                      ? 'မှာယူမှုအမျိုးအစား၊ ပေးချယ်မှုပုံစံနှင့် ကူပွန်များကို ပြောင်းလဲ၍မရပါ။ လူဦးရေ ပြောင်းလဲပါက စုစုပေါင်းငွေကို ပြန်လည်တွက်ချက်ပါမည်။' 
                      : 'Reservation type, payment method, and promo coupons cannot be modified online. Party size adjustments recalculate billing.'}
                  </p>
                </div>
              </div>

              <!-- Fee Schedule Table -->
              <div class="bg-white/90 rounded-2xl border border-[#EADFD1] p-3 text-xs">
                <div class="font-label text-[10px] font-bold text-[#58413f] uppercase mb-2">
                  ${isMm ? 'ပယ်ဖျက်ခ တွက်ချက်မှုဇယား (Cancellation Fee Schedule)' : 'Cancellation Fee Schedule'}
                </div>
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[#104b2b] font-semibold text-[11px]">
                    <span>${isMm ? 'လာရောက်မည့်အချိန်မတိုင်မီ ၂၄ နာရီအလိုအထိ' : 'More than 24 hours prior'}</span>
                    <span>0% (0 MMK - ${isMm ? 'အခမဲ့' : 'Free'})</span>
                  </div>
                  <div class="flex justify-between text-amber-700 font-semibold text-[11px]">
                    <span>${isMm ? 'လာရောက်မည့်အချိန်မတိုင်မီ ၁၂ - ၂၄ နာရီအတွင်း' : 'Within 12 - 24 hours'}</span>
                    <span>50% (${formatMMK(amountMmk * 0.5)})</span>
                  </div>
                  <div class="flex justify-between text-rose-700 font-semibold text-[11px]">
                    <span>${isMm ? '၁၂ နာရီအတွင်း သို့မဟုတ် လာမရောက်ပါက (No-show)' : 'Less than 12 hours / No-show'}</span>
                    <span>100% (${formatMMK(amountMmk)})</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- RIGHT 1 COLUMN: BILLING, PRIMARY GUEST & QR PASS CARD -->
          <div class="space-y-6">
            
            <!-- BILLING SUMMARY (MMK Primary, USD Secondary) -->
            <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 space-y-4 shadow-sm text-left">
              <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider border-b border-[#EADFD1] pb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">payments</span>
                <span>${isMm ? 'ကျသင့်ငွေ အကျဉ်းချုပ် (Billing Summary)' : 'Billing Summary'}</span>
              </div>

              <div class="space-y-2.5 text-xs">
                <div class="flex justify-between text-[#58413f]">
                  <span>${isMm ? 'ဟင်းလျာတွဲ နှုန်းထား' : 'Course Set Base'}:</span>
                  <span class="font-bold text-[#231916]">${formatMMK(amountMmk * 0.85)}</span>
                </div>
                <div class="flex justify-between text-[#58413f]">
                  <span>${isMm ? 'ကုန်သွယ်လုပ်ငန်းခွန် (5% Tax)' : 'Commercial Tax (5%)'}:</span>
                  <span class="font-bold text-[#231916]">${formatMMK(amountMmk * 0.05)}</span>
                </div>
                <div class="flex justify-between text-[#58413f]">
                  <span>${isMm ? 'ဝန်ဆောင်ခ (10% Service)' : 'Service Charge (10%)'}:</span>
                  <span class="font-bold text-[#231916]">${formatMMK(amountMmk * 0.10)}</span>
                </div>

                <div class="border-t-2 border-[#EADFD1] pt-3 flex flex-col items-end">
                  <span class="font-label text-[10px] font-bold text-[#58413f] uppercase tracking-wider">${isMm ? 'စုစုပေါင်း ကျသင့်ငွေ' : 'Total Amount Due'}</span>
                  <div class="font-headline text-2xl font-black text-[#840f16]">
                    ${formatMMK(amountMmk)}
                  </div>
                  <div class="font-label text-xs font-bold text-[#58413f]">
                    ${formatUSD(amountMmk)}
                  </div>
                </div>
              </div>

              <!-- Payment Details Pill -->
              <div class="bg-white/80 p-3.5 rounded-2xl border border-[#EADFD1] text-xs space-y-1">
                <div class="flex justify-between">
                  <span class="text-[#58413f]">${isMm ? 'ပေးချေမှုစနစ်:' : 'Payment Method:'}</span>
                  <span class="font-bold text-[#231916]">${b.paymentMethod || 'KBZPay QR'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#58413f]">${isMm ? 'ငွေပေးချေမှု အခြေအနေ:' : 'Payment Status:'}</span>
                  <span class="font-bold text-[#104b2b]">${b.paymentStatus || 'Deposit Verified'}</span>
                </div>
              </div>
            </div>

            <!-- PRIMARY GUEST CONTACT INFO -->
            <div class="bg-[#FBF3E2] rounded-3xl border border-[#EADFD1] p-6 space-y-3 shadow-sm text-left">
              <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider border-b border-[#EADFD1] pb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">person</span>
                <span>${isMm ? 'ဧည့်သည် ဆက်သွယ်ရန် အချက်အလက်' : 'Primary Guest Info'}</span>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-[#58413f]">${isMm ? 'ဧည့်သည်အမည်:' : 'Full Name:'}</span>
                  <span class="font-bold text-[#231916]">${b.guestName}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#58413f]">${isMm ? 'ဖုန်းနံပါတ်:' : 'Phone Number:'}</span>
                  <span class="font-bold text-[#231916]">${b.guestPhone}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#58413f]">${isMm ? 'အီးမေးလ်:' : 'Email:'}</span>
                  <span class="font-bold text-[#231916]">${b.guestEmail}</span>
                </div>
              </div>
            </div>

            <!-- INSTANT CHECK-IN PASS PREVIEW -->
            ${!isCancelled ? `
              <div class="bg-[#231916] text-[#FFF7E8] rounded-3xl p-6 shadow-xl space-y-4 text-center">
                <div class="font-label text-xs font-bold text-[#e8c078] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">verified_user</span>
                  <span>Official QR Dining Pass</span>
                </div>

                <div class="p-3 bg-white rounded-2xl inline-block shadow-md">
                  <img
                    src="${window.YoyakuPrototype ? window.YoyakuPrototype.createQrDataUri(`YOYAKU-${b.reservationNo}`) : ''}"
                    alt="QR Pass"
                    class="w-32 h-32 object-contain mx-auto"
                  />
                </div>

                <div class="space-y-0.5">
                  <div class="font-headline font-bold text-sm text-white">${b.restaurantName}</div>
                  <div class="font-label text-xs text-[#e8c078]">${b.date} • ${b.time}</div>
                </div>

                <button
                  id="u09-view-qr-pass-btn-2"
                  class="w-full btn-primary py-2.5 rounded-full font-label text-xs font-bold cursor-pointer"
                >
                  ${isMm ? 'Pass အပြည့်အစုံ ကြည့်မည်' : 'Enlarge Digital Pass'}
                </button>
              </div>
            ` : ''}

          </div>

        </div>

        <!-- MODALS -->
        ${renderU09AllModals(state)}

      </div>
    `;
  }

  // =========================================================================
  // MODALS (CHANGE DATE/TIME, CANCEL, REVIEW, QR PASS)
  // =========================================================================
  function renderU09AllModals(state) {
    const isMm = state.currentLanguage === 'MM';
    const changeM = state.u09ChangeModal;
    const cancelM = state.u09CancelModal;
    const reviewM = state.u09ReviewModal;
    const passM = state.inspectedPassBooking;

    let modalsHtml = '';

    // 1. CHANGE DATE & TIME MODAL ("日時を変更")
    if (changeM && changeM.isOpen) {
      const res = state.reservations.find(b => b.id === changeM.reservationId) || {};
      const dates = [
        'Aug 20, 2026', 'Aug 21, 2026', 'Aug 22, 2026', 'Aug 23, 2026',
        'Aug 24, 2026', 'Aug 25, 2026', 'Aug 26, 2026', 'Aug 27, 2026',
        'Aug 28, 2026', 'Aug 29, 2026', 'Aug 30, 2026'
      ];
      const times = ['11:30', '12:00', '12:30', '13:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

      modalsHtml += `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div class="bg-[#FFF7E8] border border-[#EADFD1] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
            
            <button id="u09-modal-close-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FBF3E2] border border-[#EADFD1] flex items-center justify-center text-[#58413f] hover:text-[#840f16] cursor-pointer">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>

            <!-- Header -->
            <div class="space-y-1 border-b border-[#EADFD1] pb-4">
              <div class="inline-flex items-center gap-1.5 bg-[#840f16]/10 text-[#840f16] px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider">
                <span class="material-symbols-outlined text-xs">edit_calendar</span>
                <span>${isMm ? '日時を変更 (ရက်စွဲ/အချိန် ပြောင်းမည်)' : 'Change Reservation Date & Time'}</span>
              </div>
              <h3 class="font-headline text-2xl font-extrabold text-[#231916]">
                ${res.restaurantName || 'Change Booking'}
              </h3>
              <p class="font-body text-xs text-[#58413f]">
                ${isMm ? 'သတ်မှတ်ထားသော အခမဲ့ပြင်ဆင်နိုင်သည့် အချိန် (cancel_hours) မတိုင်မီ ရက်စွဲနှင့် အချိန်သစ် ရွေးချယ်နိုင်ပါသည်' : 'Select a new available date, time slot, and guest count before the cutoff deadline.'}
              </p>
            </div>

            <!-- Form -->
            <form id="u09-change-datetime-form" class="space-y-5">
              
              <!-- 1. Date Selection -->
              <div class="space-y-2">
                <label class="font-label text-xs font-bold text-[#58413f] uppercase tracking-wider flex items-center justify-between">
                  <span>${isMm ? 'ရက်စွဲ အသစ် ရွေးချယ်ပါ (Select New Date)' : 'Select New Dining Date'}</span>
                  <span class="text-[#840f16] font-bold">${changeM.date}</span>
                </label>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  ${dates.map(d => {
                    const isSelected = changeM.date === d;
                    return `
                      <button
                        type="button"
                        data-u09-select-change-date="${d}"
                        class="p-2 rounded-xl border text-xs font-label font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#840f16] text-white border-[#840f16] shadow-sm'
                            : 'bg-white text-[#231916] border-[#EADFD1] hover:border-[#840f16]'
                        }"
                      >
                        ${d.split(',')[0]}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- 2. Time Slot Selection -->
              <div class="space-y-2">
                <label class="font-label text-xs font-bold text-[#58413f] uppercase tracking-wider flex items-center justify-between">
                  <span>${isMm ? 'အချိန်ကွက် အသစ် ရွေးချယ်ပါ (Available Time Slots)' : 'Select Available Time Slot'}</span>
                  <span class="text-[#840f16] font-bold">${changeM.time}</span>
                </label>
                <div class="grid grid-cols-4 gap-2">
                  ${times.map(t => {
                    const isSelected = changeM.time === t;
                    return `
                      <button
                        type="button"
                        data-u09-select-change-time="${t}"
                        class="py-2 rounded-xl border text-xs font-label font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#840f16] text-white border-[#840f16] shadow-sm'
                            : 'bg-white text-[#231916] border-[#EADFD1] hover:border-[#840f16]'
                        }"
                      >
                        ${t}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- 3. Party Size (Guests) -->
              <div class="space-y-2">
                <label class="font-label text-xs font-bold text-[#58413f] uppercase tracking-wider">
                  ${isMm ? 'ဧည့်သည် လူဦးရေ (Party Size)' : 'Party Size (Guests)'}
                </label>
                <div class="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#EADFD1]">
                  <button
                    type="button"
                    id="u09-change-guest-minus"
                    class="w-9 h-9 rounded-xl bg-[#FBF3E2] border border-[#EADFD1] flex items-center justify-center font-bold text-[#231916] hover:bg-[#840f16] hover:text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <div class="flex-1 text-center font-headline font-bold text-base text-[#231916]">
                    ${changeM.guests} ${isMm ? 'ဦး' : 'Guests'}
                  </div>
                  <button
                    type="button"
                    id="u09-change-guest-plus"
                    class="w-9 h-9 rounded-xl bg-[#FBF3E2] border border-[#EADFD1] flex items-center justify-center font-bold text-[#231916] hover:bg-[#840f16] hover:text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Price Recalculation Notice -->
              <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] space-y-1 text-xs">
                <div class="flex justify-between font-bold">
                  <span class="text-[#58413f]">${isMm ? 'စုစုပေါင်း ကျသင့်ငွေ ပြန်လည်တွက်ချက်မှု:' : 'Updated Total Amount:'}</span>
                  <span class="text-[#840f16] text-sm">${formatMMK(changeM.newAmount)}</span>
                </div>
                <div class="text-right text-[11px] text-[#58413f]">
                  ${formatUSD(changeM.newAmount)}
                </div>
              </div>

              <!-- Restrictions Note -->
              <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <span class="font-bold">⚠️ ${isMm ? 'စည်းမျဉ်း ကန့်သတ်ချက်များ:' : 'Modification Rules:'}</span>
                ${isMm 
                  ? 'မှာယူမှုအမျိုးအစား၊ ပေးချယ်မှုပုံစံနှင့် ကူပွန်များကို ပြောင်းလဲ၍မရပါ။ သတ်မှတ်ချိန် ၂၄ နာရီ မတိုင်မီအထိသာ ပြင်ဆင်နိုင်ပါသည်။' 
                  : 'Reservation plan type, payment method, and promo coupons cannot be modified. Changes must be finalized 24h prior to dining.'}
              </div>

              <!-- Submit Button -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  id="u09-cancel-change-modal-btn"
                  class="flex-1 py-3 rounded-2xl bg-white border border-[#EADFD1] font-label text-xs font-bold text-[#58413f] hover:bg-[#FBF3E2] transition-colors cursor-pointer"
                >
                  ${isMm ? 'မပြောင်းတော့ပါ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  class="flex-1 btn-primary py-3 rounded-2xl font-label text-xs font-bold shadow-md cursor-pointer"
                >
                  ${isMm ? 'အတည်ပြု ပြောင်းလဲမည်' : 'Confirm Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      `;
    }

    // 2. CANCELLATION MODAL (မှာယူမှုကို ပယ်ဖျက်ခြင်း)
    if (cancelM && cancelM.isOpen) {
      const res = state.reservations.find(b => b.id === cancelM.reservationId) || {};
      const totalAmount = res.totalAmountMMK || res.totalAmount || 350000;
      const feeAmount = cancelM.feeAmount || 0;

      modalsHtml += `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div class="bg-[#FFF7E8] border border-[#EADFD1] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
            
            <button id="u09-modal-close-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FBF3E2] border border-[#EADFD1] flex items-center justify-center text-[#58413f] hover:text-[#840f16] cursor-pointer">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>

            <!-- Header -->
            <div class="space-y-1 border-b border-[#EADFD1] pb-4">
              <div class="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider">
                <span class="material-symbols-outlined text-xs">cancel</span>
                <span>${isMm ? 'မှာယူမှုကို ပယ်ဖျက်ခြင်း' : 'Cancel Table Reservation'}</span>
              </div>
              <h3 class="font-headline text-2xl font-extrabold text-[#231916]">
                ${res.restaurantName || 'Cancel Booking'}
              </h3>
              <p class="font-body text-xs text-[#58413f]">
                ${isMm ? 'မှာယူမှုနံပါတ်' : 'Reservation Code'}: <strong>${res.reservationNo}</strong> (${res.date} • ${res.time})
              </p>
            </div>

            <!-- Cancellation Fee Breakdown Box -->
            <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] space-y-2 text-xs">
              <div class="font-label text-[10px] font-bold text-[#840f16] uppercase tracking-wider">
                ${isMm ? 'ပယ်ဖျက်ခ စနစ်မှ တွက်ချက်ပြသခြင်း (Cancellation Fee Calculation)' : 'System Calculated Cancellation Fee'}
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-[#EADFD1]">
                <span class="text-[#58413f]">${isMm ? 'မူလ စုစုပေါင်း ကျသင့်ငွေ:' : 'Original Total Billing:'}</span>
                <span class="font-bold text-[#231916]">${formatMMK(totalAmount)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[#58413f]">${isMm ? 'ကျသင့်မည့် ပယ်ဖျက်ခ (Cancellation Fee):' : 'Applicable Cancellation Fee:'}</span>
                <span class="font-bold text-rose-700 text-sm">
                  ${feeAmount === 0 ? `0 MMK (0% Free Cancellation / အခမဲ့)` : formatMMK(feeAmount)}
                </span>
              </div>
              <p class="text-[11px] text-[#58413f] pt-1 leading-relaxed">
                ${isMm 
                  ? 'ဆိုင်၏ စည်းမျဉ်းအရ သတ်မှတ်ချိန် ၂၄ နာရီ မတိုင်မီ ပယ်ဖျက်ပါက ပယ်ဖျက်ခ ကင်းလွတ်ခွင့် ရရှိပါသည်' 
                  : 'Per venue policy, cancellations initiated before the 24-hour deadline incur no cancellation penalties.'}
              </p>
            </div>

            <!-- Reason Form -->
            <form id="u09-cancel-booking-form" class="space-y-4">
              <div class="space-y-2">
                <label class="font-label text-xs font-bold text-[#58413f] uppercase tracking-wider">
                  ${isMm ? 'ပယ်ဖျက်ရသည့် အကြောင်းအရင်းကို ရွေးချယ်ပါ' : 'Please select reason for cancellation'}
                </label>
                
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EADFD1] cursor-pointer text-xs">
                    <input type="radio" name="cancel_reason" value="schedule_change" checked class="text-[#840f16] focus:ring-[#840f16]" />
                    <span>${isMm ? 'အစီအစဉ် ပြောင်းလဲသွား၍' : 'Change of schedule / plans'}</span>
                  </label>
                  <label class="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EADFD1] cursor-pointer text-xs">
                    <input type="radio" name="cancel_reason" value="wrong_booking" class="text-[#840f16] focus:ring-[#840f16]" />
                    <span>${isMm ? 'ရက်စွဲ/အချိန် မှားယွင်းစိုတ်မိ၍' : 'Accidentally selected wrong date or time'}</span>
                  </label>
                  <label class="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EADFD1] cursor-pointer text-xs">
                    <input type="radio" name="cancel_reason" value="another_venue" class="text-[#840f16] focus:ring-[#840f16]" />
                    <span>${isMm ? 'အခြား စားသောက်ဆိုင်သို့ ပြောင်းလဲစားသောက်မည် ဖြစ်၍' : 'Selected a different restaurant'}</span>
                  </label>
                  <label class="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EADFD1] cursor-pointer text-xs">
                    <input type="radio" name="cancel_reason" value="personal_emergency" class="text-[#840f16] focus:ring-[#840f16]" />
                    <span>${isMm ? 'ကျန်းမာရေး သို့မဟုတ် အရေးပေါ်ကိစ္စကြောင့်' : 'Health or personal emergency'}</span>
                  </label>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  id="u09-cancel-modal-dismiss-btn"
                  class="flex-1 py-3 rounded-2xl bg-white border border-[#EADFD1] font-label text-xs font-bold text-[#58413f] hover:bg-[#FBF3E2] transition-colors cursor-pointer"
                >
                  ${isMm ? 'မပယ်ဖျက်တော့ပါ' : 'Keep Reservation'}
                </button>
                <button
                  type="submit"
                  class="flex-1 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-label text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  ${isMm ? 'မှာယူမှုကို ပယ်ဖျက်မည်' : 'Confirm Cancellation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      `;
    }

    // 3. WRITE REVIEW MODAL (口コミを書く)
    if (reviewM && reviewM.isOpen) {
      modalsHtml += `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div class="bg-[#FFF7E8] border border-[#EADFD1] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
            
            <button id="u09-modal-close-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FBF3E2] border border-[#EADFD1] flex items-center justify-center text-[#58413f] hover:text-[#840f16] cursor-pointer">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>

            <!-- Header -->
            <div class="space-y-1 border-b border-[#EADFD1] pb-4">
              <div class="inline-flex items-center gap-1.5 bg-[#e8c078]/30 text-[#840f16] px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider">
                <span class="material-symbols-outlined text-xs">rate_review</span>
                <span>${isMm ? '口コミを書く (Review ရေးရန်)' : 'Write Dining Review'}</span>
              </div>
              <h3 class="font-headline text-2xl font-extrabold text-[#231916]">
                ${reviewM.restaurantName}
              </h3>
              <p class="font-body text-xs text-[#58413f]">
                ${isMm ? 'စားသောက်မှု အတွေ့အကြုံကို ဝေမျှပြီး +500 Gourmet Points ရယူပါ' : 'Share your genuine dining experience and earn +500 Gourmet Points.'}
              </p>
            </div>

            <!-- Review Form -->
            <form id="u09-review-form" class="space-y-4">
              
              <!-- Star Rating Ratings -->
              <div class="space-y-3 bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1]">
                
                <div class="flex justify-between items-center">
                  <span class="font-headline font-bold text-xs text-[#231916]">${isMm ? 'အလုံးစုံ ကျေနပ်မှု (Overall Rating)' : 'Overall Rating'}</span>
                  <div class="flex gap-1 text-[#840f16]">
                    ${[1, 2, 3, 4, 5].map(star => `
                      <button type="button" data-u09-star-overall="${star}" class="cursor-pointer">
                        <span class="material-symbols-outlined text-lg ${star <= reviewM.overallRating ? 'text-[#840f16]' : 'text-gray-300'}">star</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-[#58413f]">${isMm ? 'အစားအစာ အရသာ (Food Quality)' : 'Food & Flavor'}</span>
                  <div class="flex gap-1 text-[#840f16]">
                    ${[1, 2, 3, 4, 5].map(star => `
                      <button type="button" data-u09-star-food="${star}" class="cursor-pointer">
                        <span class="material-symbols-outlined text-base ${star <= reviewM.foodRating ? 'text-[#840f16]' : 'text-gray-300'}">star</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-[#58413f]">${isMm ? 'ဝန်ဆောင်မှု အဆင့်အတန်း (Service)' : 'Service Hospitality'}</span>
                  <div class="flex gap-1 text-[#840f16]">
                    ${[1, 2, 3, 4, 5].map(star => `
                      <button type="button" data-u09-star-service="${star}" class="cursor-pointer">
                        <span class="material-symbols-outlined text-base ${star <= reviewM.serviceRating ? 'text-[#840f16]' : 'text-gray-300'}">star</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-[#58413f]">${isMm ? 'ဆိုင်တွင်း အပြင်အဆင် (Ambience)' : 'Atmosphere & Ambience'}</span>
                  <div class="flex gap-1 text-[#840f16]">
                    ${[1, 2, 3, 4, 5].map(star => `
                      <button type="button" data-u09-star-ambience="${star}" class="cursor-pointer">
                        <span class="material-symbols-outlined text-base ${star <= reviewM.ambienceRating ? 'text-[#840f16]' : 'text-gray-300'}">star</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

              </div>

              <!-- Comment Textarea -->
              <div class="space-y-1">
                <label class="font-label text-xs font-bold text-[#58413f] uppercase tracking-wider">
                  ${isMm ? 'သုံးသပ်ချက် ရေးသားပါ (Your Review)' : 'Detailed Feedback & Review'}
                </label>
                <textarea
                  id="u09-review-comment"
                  rows="3"
                  required
                  placeholder="${isMm ? 'အရသာ၊ ဝန်ဆောင်မှု၊ စားပွဲဝိုင်း သက်တောင့်သက်သာရှိမှု အတွေ့အကြုံများကို ဝေမျှပါ...' : 'Describe the flavours, ambience, hospitality, and standout dishes...'}"
                  class="w-full bg-[#FFF8F6] border border-[#EADFD1] focus:border-[#840f16] rounded-2xl p-3 font-body text-xs sm:text-sm text-[#231916] focus:outline-none"
                >${reviewM.comment || ''}</textarea>
              </div>

              <!-- Submit Review Button -->
              <button
                type="submit"
                class="w-full btn-primary py-3.5 rounded-2xl font-label text-xs font-bold shadow-md cursor-pointer"
              >
                ${isMm ? 'သုံးသပ်ချက် ပေးပို့မည် (Submit Review & Earn +500 Pts)' : 'Submit Review (+500 Points)'}
              </button>

            </form>

          </div>
        </div>
      `;
    }

    // 4. QR PASS ENLARGED INSPECTION MODAL
    if (passM) {
      modalsHtml += `
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-[#FFF7E8] w-full max-w-md rounded-3xl border border-[#EADFD1] shadow-2xl overflow-hidden p-6 text-center space-y-5 text-left">
            
            <div class="flex justify-between items-center border-b border-[#EADFD1] pb-3">
              <div class="font-label text-xs font-bold text-[#840f16] uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">verified_user</span>
                <span>Official Check-In Dining Pass</span>
              </div>
              <button id="u09-modal-close-btn" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#58413f] hover:text-[#840f16] cursor-pointer">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div class="space-y-1 text-center">
              <h3 class="font-headline text-xl font-bold text-[#231916]">
                ${passM.restaurantName}
              </h3>
              <p class="font-body text-xs text-[#58413f]">
                Pass #${passM.reservationNo}
              </p>
            </div>

            <!-- QR Image Box -->
            <div class="p-4 bg-[#231916] rounded-2xl inline-block shadow-lg qr-glow my-2 w-full text-center">
              <img
                src="${window.YoyakuPrototype ? window.YoyakuPrototype.createQrDataUri(`YOYAKU-${passM.reservationNo}`) : ''}"
                alt="QR Pass"
                class="w-44 h-44 object-contain mx-auto"
              />
              <div class="font-label text-[10px] text-[#e8c078] tracking-widest uppercase mt-2">
                Scan upon arrival at reception
              </div>
            </div>

            <div class="bg-[#FBF3E2] p-4 rounded-2xl border border-[#EADFD1] font-label text-xs space-y-1.5 text-left">
              <div class="flex justify-between">
                <span class="text-[#58413f]">Date & Time:</span>
                <span class="font-bold text-[#231916]">${passM.date} at ${passM.time}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#58413f]">Party Size:</span>
                <span class="font-bold text-[#231916]">${passM.guests} Guests</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#58413f]">Primary Guest:</span>
                <span class="font-bold text-[#231916]">${passM.guestName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#58413f]">Table Preference:</span>
                <span class="font-bold text-[#840f16]">${passM.seatingPreference || 'Standard Table'}</span>
              </div>
            </div>

            <button
              id="u09-modal-done-btn"
              class="w-full btn-primary py-3 rounded-full font-label text-xs font-bold cursor-pointer"
            >
              Done
            </button>

          </div>
        </div>
      `;
    }

    return modalsHtml;
  }

  // =========================================================================
  // EVENT ATTACHMENTS FOR U-09
  // =========================================================================
  function attachReservationsListViewEvents(containerElement = document) {
    // 1. Back to List
    const backBtn = containerElement.querySelector('#u09-back-to-list-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        store.clearSelectedReservationDetail();
      });
    }

    // 2. Book new table
    const bookNewBtn = containerElement.querySelector('#resv-book-new-btn');
    if (bookNewBtn) {
      bookNewBtn.addEventListener('click', () => {
        store.setActiveTab('discover');
      });
    }

    const emptyDiscoverBtn = containerElement.querySelector('#resv-empty-discover-btn');
    if (emptyDiscoverBtn) {
      emptyDiscoverBtn.addEventListener('click', () => {
        store.setActiveTab('discover');
      });
    }

    // 3. Guest lookup button
    const guestLookupBtn = containerElement.querySelector('#u09-guest-lookup-btn');
    if (guestLookupBtn) {
      guestLookupBtn.addEventListener('click', () => {
        store.openInfoModal('check_guest_booking');
      });
    }

    // 4. View Detail from card
    containerElement.querySelectorAll('[data-u09-view-detail-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const resId = e.currentTarget.getAttribute('data-u09-view-detail-id');
        store.selectReservationForDetail(resId, false);
      });
    });

    // 5. QR Pass trigger
    const qrPassBtn = containerElement.querySelector('#u09-view-qr-pass-btn');
    if (qrPassBtn) {
      qrPassBtn.addEventListener('click', () => {
        const state = store.getState();
        const currentRes = state.reservations.find(b => b.id === state.selectedReservationId);
        if (currentRes) store.setInspectedPassBooking(currentRes);
      });
    }

    const qrPassBtn2 = containerElement.querySelector('#u09-view-qr-pass-btn-2');
    if (qrPassBtn2) {
      qrPassBtn2.addEventListener('click', () => {
        const state = store.getState();
        const currentRes = state.reservations.find(b => b.id === state.selectedReservationId);
        if (currentRes) store.setInspectedPassBooking(currentRes);
      });
    }

    containerElement.querySelectorAll('[data-resv-view-pass-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bId = e.currentTarget.getAttribute('data-resv-view-pass-id');
        const booking = store.getState().reservations.find(b => b.id === bId);
        if (booking) store.setInspectedPassBooking(booking);
      });
    });

    // 6. Change Date/Time Modal Open ("日時を変更")
    const changeBtn = containerElement.querySelector('#u09-change-datetime-btn');
    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        const state = store.getState();
        if (state.selectedReservationId) {
          store.openU09ChangeModal(state.selectedReservationId);
        }
      });
    }

    // Date / Time selection inside Change Modal
    containerElement.querySelectorAll('[data-u09-select-change-date]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const d = e.currentTarget.getAttribute('data-u09-select-change-date');
        store.updateU09ChangeField('date', d);
      });
    });

    containerElement.querySelectorAll('[data-u09-select-change-time]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const t = e.currentTarget.getAttribute('data-u09-select-change-time');
        store.updateU09ChangeField('time', t);
      });
    });

    const guestMinusBtn = containerElement.querySelector('#u09-change-guest-minus');
    if (guestMinusBtn) {
      guestMinusBtn.addEventListener('click', () => {
        const current = store.getState().u09ChangeModal.guests || 2;
        store.updateU09ChangeField('guests', current - 1);
      });
    }

    const guestPlusBtn = containerElement.querySelector('#u09-change-guest-plus');
    if (guestPlusBtn) {
      guestPlusBtn.addEventListener('click', () => {
        const current = store.getState().u09ChangeModal.guests || 2;
        store.updateU09ChangeField('guests', current + 1);
      });
    }

    const changeForm = containerElement.querySelector('#u09-change-datetime-form');
    if (changeForm) {
      changeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resId = store.getState().u09ChangeModal.reservationId;
        store.confirmU09Change(resId);
      });
    }

    const cancelChangeBtn = containerElement.querySelector('#u09-cancel-change-modal-btn');
    if (cancelChangeBtn) {
      cancelChangeBtn.addEventListener('click', () => {
        store.closeU09ChangeModal();
      });
    }

    // 7. Cancel Reservation Modal Open
    const cancelBtn = containerElement.querySelector('#u09-cancel-booking-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const state = store.getState();
        if (state.selectedReservationId) {
          store.openU09CancelModal(state.selectedReservationId);
        }
      });
    }

    const cancelForm = containerElement.querySelector('#u09-cancel-booking-form');
    if (cancelForm) {
      cancelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = containerElement.querySelector('input[name="cancel_reason"]:checked')?.value || 'schedule_change';
        store.setU09CancelReason(reason);
        const resId = store.getState().u09CancelModal.reservationId;
        store.confirmU09Cancellation(resId);
      });
    }

    const cancelDismissBtn = containerElement.querySelector('#u09-cancel-modal-dismiss-btn');
    if (cancelDismissBtn) {
      cancelDismissBtn.addEventListener('click', () => {
        store.closeU09CancelModal();
      });
    }

    // 8. Write Review Modal
    const writeReviewBtn = containerElement.querySelector('#u09-write-review-btn');
    if (writeReviewBtn) {
      writeReviewBtn.addEventListener('click', () => {
        const state = store.getState();
        if (state.selectedReservationId) {
          store.openU09ReviewModal(state.selectedReservationId);
        }
      });
    }

    containerElement.querySelectorAll('[data-u09-open-review-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const resId = e.currentTarget.getAttribute('data-u09-open-review-id');
        store.openU09ReviewModal(resId);
      });
    });

    // Rating star clicks
    ['overall', 'food', 'service', 'ambience'].forEach(category => {
      containerElement.querySelectorAll(`[data-u09-star-${category}]`).forEach(starBtn => {
        starBtn.addEventListener('click', (e) => {
          const val = parseInt(e.currentTarget.getAttribute(`data-u09-star-${category}`), 10) || 5;
          store.setU09ReviewField(`${category}Rating`, val);
        });
      });
    });

    const reviewForm = containerElement.querySelector('#u09-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const comment = containerElement.querySelector('#u09-review-comment')?.value || '';
        store.setU09ReviewField('comment', comment);
        const resId = store.getState().u09ReviewModal.reservationId;
        store.submitU09Review(resId);
      });
    }

    // 9. Re-booking Button (One-tap Re-booking)
    const rebookBtn = containerElement.querySelector('#u09-rebook-btn');
    if (rebookBtn) {
      rebookBtn.addEventListener('click', () => {
        const state = store.getState();
        if (state.selectedReservationId) {
          store.rebookReservation(state.selectedReservationId);
        }
      });
    }

    containerElement.querySelectorAll('[data-u09-rebook-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const resId = e.currentTarget.getAttribute('data-u09-rebook-id');
        store.rebookReservation(resId);
      });
    });

    // 10. View Venue Page
    const venuePageBtn = containerElement.querySelector('#u09-view-restaurant-page-btn');
    if (venuePageBtn) {
      venuePageBtn.addEventListener('click', () => {
        const state = store.getState();
        const res = state.reservations.find(b => b.id === state.selectedReservationId);
        if (res) {
          const { RESTAURANTS_DATA } = window.YoyakuData || {};
          const target = RESTAURANTS_DATA && RESTAURANTS_DATA.find(r => r.id === res.restaurantId);
          if (target) {
            store.setSelectedRestaurant(target);
          }
        }
      });
    }

    // Modal Close
    containerElement.querySelectorAll('#u09-modal-close-btn, #u09-modal-done-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        store.closeU09ChangeModal();
        store.closeU09CancelModal();
        store.closeU09ReviewModal();
        store.setInspectedPassBooking(null);
      });
    });
  }

  window.YoyakuComponents.renderReservationsListView = renderReservationsListView;
  window.YoyakuComponents.renderReservationDetailView = renderReservationDetailView;
  window.YoyakuComponents.attachReservationsListViewEvents = attachReservationsListViewEvents;
})();
