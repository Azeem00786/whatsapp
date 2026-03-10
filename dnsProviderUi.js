// UI for DNS Provider Detection
const express = require('express');
const path = require('path');
const dns = require('dns').promises;

// Use your existing identifyDNSProvider logic
function identifyDNSProvider(nameservers) {
  const mapping = [
    { keyword: 'cloudflare.com', provider: 'Cloudflare' },
    { keyword: 'domaincontrol.com', provider: 'GoDaddy' },
    { keyword: 'namecheaphosting.com', provider: 'Namecheap' },
    { keyword: 'awsdns', provider: 'AWS Route 53' },
    { keyword: 'google.com', provider: 'Google Domains' },
    { keyword: 'hostgator.com', provider: 'HostGator' },
    { keyword: 'bluehost.com', provider: 'Bluehost' },
  ];
  for (const ns of nameservers) {
    for (const map of mapping) {
      if (ns.includes(map.keyword)) {
        return map.provider;
      }
    }
  }
  return 'Unknown or Custom Provider';
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { provider: null, error: null, domain: '', nameservers: null });
});

app.post('/detect', async (req, res) => {
  const domain = req.body.domain;
  try {
    const nameservers = await dns.resolveNs(domain);
    const provider = identifyDNSProvider(nameservers);
    res.render('index', { provider, error: null, domain, nameservers });
  } catch (err) {
    res.render('index', { provider: null, error: 'Could not resolve nameservers for this domain.', domain, nameservers: null });
  }
});

app.post('/add-dns-record', (req, res) => {
  // For now, just log the data; you can add provider API integration later
  const { domain, type, name, value } = req.body;
  console.log(`Add DNS Record: Domain=${domain}, Type=${type}, Name=${name}, Value=${value}`);
  // Optionally, show a success message in the UI
  res.render('index', {
    provider: null,
    error: null,
    domain: '',
    nameservers: null,
    message: 'DNS record submitted (not yet added via API).'
  });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`DNS Provider UI running at http://localhost:${PORT}`);
});