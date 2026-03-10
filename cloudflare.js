const axios = require('axios');

const apiToken = '7RalFY2o7Ubc_VaGDolAlFzN22iPpGCiB5ElufP5'; // Replace with your actual API token

/**
 * Gets all zones from Cloudflare account
 * @returns {Promise<Array>} List of zones
 */
async function getZones() {
  try {
    const response = await axios.get(
      'https://api.cloudflare.com/client/v4/zones',
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      return response.data.result;
    } else {
      console.error('Error fetching zones:', response.data.errors);
      return [];
    }
  } catch (error) {
    console.error('Error fetching zones:', error.message);
    return [];
  }
}

/**
 * Finds zone ID by domain name
 * @param {string} domainName - Domain name to find zone for
 * @returns {Promise<string|null>} Zone ID if found, null otherwise
 */
async function getZoneIdByDomain(domainName) {
  const zones = await getZones();
  const zone = zones.find(z => z.name === domainName);
  return zone ? zone.id : null;
}

/**
 * Adds DNS record to specified domain
 * @param {string} domainName - Domain name to add record to
 * @returns {Promise<void>}
 */
async function addDNSRecord(domainName) {
  try {
    const zoneId = await getZoneIdByDomain(domainName);
    
    if (!zoneId) {
      console.error(`Zone ID not found for domain: ${domainName}`);
      return;
    }
    
    console.log(`Found Zone ID for ${domainName}: ${zoneId}`);
    
    const res = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        type: 'CNAME',
        name: 'www',
        content: 'shop.hyperzod.app',
        ttl: 1,
        proxied: false
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(res.data);
  } catch (error) {
    if (error.response) {
      console.error('Cloudflare API error:', error.response.data);
    } else {
      console.error('Error adding DNS record:', error.message);
    }
  }
}

/**
 * Fetches all DNS records for a given domain and name
 * @param {string} domainName - Domain name to search in
 * @param {string} recordName - DNS record name to match (e.g., 'www')
 * @returns {Promise<Array>} Array of matching DNS records
 */
async function fetchDnsRecordsByName(domainName, recordName) {
  const zoneId = await getZoneIdByDomain(domainName);
  if (!zoneId) {
    console.error(`Zone ID not found for domain: ${domainName}`);
    return [];
  }
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${recordName}.${domainName}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result;
  } catch (error) {
    console.error('Error fetching DNS records:', error.message);
    return [];
  }
}

/**
 * Deletes a DNS record by its ID
 * @param {string} domainName - Domain name
 * @param {string} recordId - DNS record ID to delete
 * @returns {Promise<void>}
 */
async function deleteDnsRecord(domainName, recordId) {
  const zoneId = await getZoneIdByDomain(domainName);
  if (!zoneId) {
    console.error(`Zone ID not found for domain: ${domainName}`);
    return;
  }
  try {
    const response = await axios.delete(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Deleted DNS record:', response.data);
  } catch (error) {
    console.error('Error deleting DNS record:', error.message);
  }
}

/**
 * Fetches all DNS records of a specific type for a given domain
 * @param {string} domainName - Domain name to search in
 * @param {string} recordType - DNS record type to match ('A' or 'AAAA')
 * @returns {Promise<Array>} Array of matching DNS records
 */
async function fetchDnsRecordsByType(domainName, recordType) {
  const zoneId = await getZoneIdByDomain(domainName);
  if (!zoneId) {
    console.error(`Zone ID not found for domain: ${domainName}`);
    return [];
  }
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${recordType}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.result;
  } catch (error) {
    console.error('Error fetching DNS records:', error.message);
    return [];
  }
}

// Example usage to fetch and delete all A and AAAA records for 'chatzoy.com'
(async () => {
  const domain = 'chatzoy.com';
  const types = ['A', 'AAAA'];
  for (const type of types) {
    const records = await fetchDnsRecordsByType(domain, type);
    for (const record of records) {
      await deleteDnsRecord(domain, record.id);
    }
  }
})();

// Example usage
addDNSRecord('chatzoy.com'); // Replace with your actual domain name

/**
 * Adds a CNAME DNS record to the specified domain
 * @param {string} domainName - Domain name to add record to
 * @param {string} recordName - DNS record name (e.g., 'www', '@', 'admin.chatzoy.com')
 * @param {string} target - Target value for the CNAME record
 * @param {boolean} proxied - Whether to enable Cloudflare proxy (false for now)
 */
async function addCnameRecord(domainName, recordName, target, proxied = false) {
  try {
    const zoneId = await getZoneIdByDomain(domainName);
    if (!zoneId) {
      console.error(`Zone ID not found for domain: ${domainName}`);
      return;
    }
    const res = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        type: 'CNAME',
        name: recordName,
        content: target,
        ttl: 1,
        proxied: proxied
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Added CNAME record: ${recordName} -> ${target}`, res.data);
  } catch (error) {
    if (error.response) {
      console.error('Cloudflare API error:', error.response.data);
    } else {
      console.error('Error adding DNS record:', error.message);
    }
  }
}

// Example usage for chatzoy.com:
(async () => {
  const domain = 'chatzoy.com';
  // 1. www -> shop.hyperzod.app
  await addCnameRecord(domain, 'www', 'shop.hyperzod.app', false);
  // 2. @ (root) -> shop.hyperzod.app
  await addCnameRecord(domain, '@', 'shop.hyperzod.app', false);
  // 3. admin.chatzoy.com -> t.hyperzod.app
  await addCnameRecord(domain, 'admin.chatzoy.com', 't.hyperzod.app', false);
})();
