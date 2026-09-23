/* Shared themed dropdown. Any new dropdown on the site should use this rather than a
   raw <select>, so it matches the dark-mode menus on Track Record / Encyclopedia:
     <select id="x"><option value="">Choose…</option>…</select>
     <script src="select.js"></script>
     <script>enhanceSelect(document.getElementById('x'));</script>
   The native <select> stays in the DOM (hidden), so .value reads and 'change' listeners keep working. */
function enhanceSelect(select) {
  const wrap = document.createElement('div');
  wrap.className = 'select-wrap';
  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'select-trigger';
  trigger.textContent = select.options[select.selectedIndex].textContent;
  wrap.appendChild(trigger);

  const menu = document.createElement('div');
  menu.className = 'select-menu';
  Array.from(select.options).forEach(opt => {
    const item = document.createElement('div');
    item.className = 'select-option' + (opt.selected ? ' selected' : '');
    item.textContent = opt.textContent;
    item.addEventListener('click', () => {
      select.value = opt.value;
      trigger.textContent = opt.textContent;
      menu.querySelectorAll('.select-option').forEach(o => o.classList.remove('selected'));
      item.classList.add('selected');
      wrap.classList.remove('open');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    });
    menu.appendChild(item);
  });
  wrap.appendChild(menu);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.select-wrap.open').forEach(w => { if (w !== wrap) w.classList.remove('open'); });
    wrap.classList.toggle('open');
  });
  document.addEventListener('click', () => wrap.classList.remove('open'));
  return wrap;
}
