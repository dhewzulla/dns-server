'use strict';

let dns = require('native-dns');
let async = require('async');
const fs = require('fs');
var http = require('http');
var request = require('request');
var config = require("./config.json");


const logContentToFile = (content, onComplete) => {
    const filename = `${config.logs.output}/dns_logs.txt`    
    const now = new Date();
    

    console.log(content);

    fs.appendFile(filename, `\n ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} \t ${content}`, (err) => {

        onComplete && onComplete(err);
    });
};

const getDNSServiceByClientIP =(clientIP)=>{
    
    
    const matched=config.dnsServices.filter(dnsService=>{
          const matchedClients=dnsService.clients.filter(client => clientIP.startsWith(client));          
          return !!matchedClients.length;
    });    
    if(matched.length){
      return matched[0];
    }
    else{
      return null;
    }
};


let server = dns.createServer();
  
  function handleRequest(request, response) {
    console.log('request from', request.address.address, 'for', request.question[0].name);
    
    const  dnsService = getDNSServiceByClientIP(request.address.address);
    

    let logRecord=request.question.reduce((sum,q)=>sum+q.name+'\t','[from '+request.address.address+'] ');


    const  proxyToAuthority = (question, response, cb)  => {
  
      var request = dns.Request({
        question: question, 
        server: config.authority,  
        timeout: 1000
      });
          
      request.on('message', (err, msg) => {
        msg.answer.forEach(a => {                             
              if(a.ttl && a.ttl>config.ttl){
                  a.ttl=config.ttl;
              }              
              response.answer.push(a);      
              if(a.address){                
                   logRecord=logRecord+a.address+'\t';
               }
               else if(a.data){
                  logRecord=logRecord+a.data+'\t';
               }
               else{
                logRecord=logRecord+JSON.stringify(a)+'\t';
               }
               if(a.ttl){
                  logRecord=logRecord+a.ttl+'\t';
                }
         });
      });    
      request.on('end', cb);
      request.send();
    }

    

  
    let tasks = [];
  
    request.question.forEach(question => {

      if(!dnsService){        
          logContentToFile(logRecord+'\t'+'*******no DNS Service setup for for '+request.address.address+' ************');
          response.answer.push(dns['A']({
            name:question.name,
            ttl:config.sink.ttl || config.ttl,
            type:'A',
            address:config.sink.address
          }));        
      }
      else{
        let entry = dnsService.entries && dnsService.entries.filter(r => r.domain === question.name);
        const matchedEntry=entry && entry.length && entry[0];
        if (matchedEntry) {
                matchedEntry.records.forEach(record => {
                     record.name = question.name;          
                     record.ttl = record.ttl || config.ttl;
                     if (record.type == 'CNAME') {                
                          logRecord=logRecord+record.address+'\t';
                          tasks.push(cb => proxyToAuthority({ name: record.address, type: dns.consts.NAME_TO_QTYPE.A, class: 1 }, response, cb));            
                     }
                    else{
                          logRecord=logRecord+record.address+'\t'+record.ttl+'\t';
                          response.answer.push(dns[record.type](record));
                    }          
                });
         } else {        
        tasks.push(cb => proxyToAuthority(question, response, cb));
      }

      }

      
    });
    
    async.parallel(tasks, function() {
      
      response.send(); 
      logContentToFile(logRecord);      
      });
  }
  


server.on('listening', () => console.log('server listening on', server.address()));
server.on('close', () => console.log('server closed', server.address()));
server.on('error', (err, buff, req, res) => console.error(err.stack));
server.on('socketError', (err, socket) => console.error(err));
server.on('request', handleRequest);

server.serve(config.port);



var httpServer = http.createServer(function (req, res) {

  const uwpConfig={
       webapp:{     
        url:config.uwp.url
      },
      webapps:[]
  };
  config.uwp.webapps.forEach(webapp=>{
    uwpConfig.webapps.push({
      name:webapp.name,
      url:webapp.url
    });
  });
  if(req.method == 'OPTIONS'){				
		res.writeHead(204, { 'Content-Type': "application/json" });
		res.end();
	}
  else if(req.url.startsWith("/uwp/uwp-test-config.json")){
		  res.setHeader('Content-Type', "application/json");
	    res.end(JSON.stringify(uwpConfig,null, 2));             
	}
  else{
    res.end(`<html><body><h1>DNS Server</h1>				
			</body></html>`);		
  }
  


});


httpServer.listen(config.uwp.port);