const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

const searchBtn = document.getElementById('searchBtn'), searchModal = document.getElementById('searchModal'), closeBtn = document.getElementById('closeSearchBtn'), input = document.getElementById('searchInput'), results = document.getElementById('searchResults');
let index = [];

const toggleSearch = async (show) => {
  if (show) {
    searchModal.removeAttribute('hidden'); input.focus(); document.body.style.overflow = 'hidden';
    if (!index.length) index = await fetch('/search.json').then(r => r.json()).catch(() => []);
  } else {
    searchModal.setAttribute('hidden', ''); input.value = ''; results.innerHTML = ''; document.body.style.overflow = '';
  }
};

searchBtn.addEventListener('click', () => toggleSearch(true));
closeBtn.addEventListener('click', () => toggleSearch(false));
searchModal.addEventListener('click', e => { if(e.target === searchModal) toggleSearch(false); });

input.addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  results.innerHTML = '';
  if (!q) return;
  const matches = index.filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.content && i.content.toLowerCase().includes(q))).slice(0, 6);
  matches.forEach(m => {
    const a = document.createElement('a'); a.href = m.url;
    a.innerHTML = `<strong>${m.title}</strong><br><small style="color:var(--color-muted)">${m.content.substring(0, 80)}...</small>`;
    results.appendChild(a);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !searchModal.hasAttribute('hidden')) toggleSearch(false);
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(true); }
});
