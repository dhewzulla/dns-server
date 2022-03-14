docker rm -f dnsproxy

docker run -d --name dnsproxy -p 53:53/udp -p 53:53/tcp -i -t \
-v /root/dnsproxy/app:/app \
-v /root/globalinput/web/connected-tv/feeds/:/var/c4feeds \
dilshat/dnsproxy
