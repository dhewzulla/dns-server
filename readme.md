# DNS Server
Author: Dilshat Hewzulla

Unique Features of the this DNS server
  - Every client can have different DNS configuration, which mean a domain can be resolved to a different IP address depending on the IP address of the client sending the DNS query.
  - Unknow client will receive a same IP address for all domains to sink the illegal DNS queries 
  - All DNS query can be set to very short TTL so that any DNS can be changed immediately, even the responses of the forwarded DNS query results will be modified to set the TTL specifiied in the config.






### app/config.json

* [logs] - the local of the log file
* [ttl] - default TTL
* [authority] - DNS server that the DNS queries not matched in the config will be forwarded to.
* [dnsServices] - array of config element, each represent a DNS client that this DNS service can serve.
  - clients: the ip address of the client that this DNS can serve
  - entries:each element corresponding to one domain record. if this element empty, all the DNS query will be forwarded.
  --domain: domain name
   --record: domain record.


