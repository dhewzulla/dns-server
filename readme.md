
# DNS Server

  
 # Features

- Separate DNS configuration for each client , allowing a domain to be resolved to a different IP address depending on  the client sending the request --- useful client specific configuration in device application tests.  

- Discarding requests from unauthorized clients.

- All DNS query are set to a short TTL to enable instant configurations.  

# Usage

Download, install and run  the DNS node server using the following commands on your terminal:

```
   git clone git@github.com:dhewzulla/dns-server.git

   cd dns-server

   cd app

   npm install

   npx nodemon server.js
 
 ```

### app/config.json

 
* [logs] - the local of the log file

* [ttl] - default TTL

* [authority] - DNS server that the DNS queries not matched in the config will be forwarded to.

* [dnsServices] - array of config element, each represent a DNS client that this DNS service can serve.

- clients: the ip address of the client that this DNS can serve

- entries:each element corresponding to one domain record. if this element empty, all the DNS query will be forwarded.

--domain: domain name

--record: domain record.

  
  


  

  


