/* Cook sign-up form (partner.html): fills the option lists, validates and submits. */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const CH = window.CH;
    const { $, $$, esc, data, menus, cfg } = CH;
    const form = $('#partner-form');
    const errorBox = $('#p-error');

    const chip = (name, value, label) =>
      `<label class="chip"><input type="checkbox" name="${name}" value="${esc(value)}"><span>${esc(label)}</span></label>`;

    $('#p-city').insertAdjacentHTML('beforeend', cfg.cities.map((c) => `<option>${esc(c)}</option>`).join(''));
    $('#p-traditions').innerHTML = menus.traditions.map((t) => chip('traditions', t.name, t.name)).join('');
    $('#p-occasions').innerHTML = data.occasions.filter((o) => o.id !== 'other').map((o) => chip('occasions', o.name, o.name)).join('');
    $('#p-rules').innerHTML = ['Satvik (no onion, no garlic)', 'Jain', 'Non-vegetarian'].map((r) => chip('rules', r, r)).join('');

    const setError = (input, message) => {
      const id = `${input.id}-err`;
      let el = document.getElementById(id);
      if (!message) {
        if (el) el.remove();
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        return;
      }
      if (!el) {
        el = document.createElement('span');
        el.id = id;
        el.className = 'field-error';
        (input.closest('.check') || input).insertAdjacentElement('afterend', el);
      }
      el.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    };

    const phoneDigits = (v) => {
      let d = String(v).replace(/\D/g, '');
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      return d;
    };

    const checks = [
      ['#p-name', (v) => v.trim().length >= 2 || 'Enter your name.'],
      ['#p-phone', (v) => /^[6-9]\d{9}$/.test(phoneDigits(v)) || 'Enter a 10-digit Indian mobile number.'],
      ['#p-city', (v) => Boolean(v) || 'Choose your city.'],
      ['#p-experience', (v) => Boolean(v) || 'Choose your experience.'],
      ['#p-dishes', (v) => v.trim().length >= 3 || 'Tell us a few dishes you are known for.'],
      ['#p-link', (v) => !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim()) || 'Enter a full link starting with https://'],
    ];

    const validate = () => {
      let first = null;
      checks.forEach(([sel, test]) => {
        const input = $(sel);
        const result = test(input.value);
        setError(input, result === true ? '' : result);
        if (result !== true && !first) first = input;
      });
      const traditionsOk = $$('input[name="traditions"]:checked').length > 0;
      const group = $('#p-traditions-group');
      let tErr = $('#p-traditions-err');
      if (!traditionsOk && !tErr) {
        tErr = document.createElement('p');
        tErr.id = 'p-traditions-err';
        tErr.className = 'field-error';
        tErr.textContent = 'Pick at least one tradition.';
        group.append(tErr);
      } else if (traditionsOk && tErr) tErr.remove();
      if (!traditionsOk && !first) first = $('input[name="traditions"]');
      const consent = $('#p-consent');
      setError(consent, consent.checked ? '' : 'Please allow us to contact you.');
      if (!consent.checked && !first) first = consent;
      return first;
    };

    form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') validate(); });
    form.addEventListener('change', (e) => { if (e.target.name === 'traditions' || e.target.id === 'p-consent') validate(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.textContent = '';
      const first = validate();
      if (first) { errorBox.textContent = 'Please fix the highlighted details.'; first.focus(); return; }

      const fd = new FormData(form);
      const payload = {
        ref: CH.reference('CK'),
        name: fd.get('name').trim(),
        phone: phoneDigits(fd.get('phone')),
        city: fd.get('city'),
        area: fd.get('area').trim(),
        experience: fd.get('experience'),
        traditions: fd.getAll('traditions'),
        dishes: fd.get('dishes').trim(),
        occasions: fd.getAll('occasions'),
        rules: fd.getAll('rules'),
        largestGroup: fd.get('largest'),
        team: fd.get('team'),
        languages: fd.get('languages').trim(),
        link: fd.get('link').trim(),
      };

      const button = $('#p-submit');
      button.disabled = true;
      button.textContent = 'Sending…';
      try {
        const result = await CH.submit('partner', payload);
        form.hidden = true;
        const done = $('#p-done');
        done.hidden = false;
        $('#p-ref').textContent = payload.ref;
        $('#p-demo').hidden = !result.demo;
        done.scrollIntoView({ block: 'start' });
        $('#p-done-title').focus();
      } catch (err) {
        errorBox.textContent = 'We couldn\'t send your application. Check your internet connection and try again.';
        button.disabled = false;
        button.innerHTML = `Send application ${CH.icon('arrowRight')}`;
      }
    });
  });
})();
