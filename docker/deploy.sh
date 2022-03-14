export deploy_to_hostname="$1"
export deploy_to_username="$2"


ssh $deploy_to_username@$deploy_to_hostname "mkdir dnsproxy"



scp docker/start.sh $deploy_to_username@$deploy_to_hostname:dnsproxy/
scp docker/build.sh $deploy_to_username@$deploy_to_hostname:dnsproxy/
scp docker/Dockerfile $deploy_to_username@$deploy_to_hostname:dnsproxy/


rsync -azvv app/ $deploy_to_username@$deploy_to_hostname:dnsproxy/app/

ssh $deploy_to_username@$deploy_to_hostname "cd dnsproxy && ./build.sh"
ssh $deploy_to_username@$deploy_to_hostname "cd dnsproxy && ./start.sh"
