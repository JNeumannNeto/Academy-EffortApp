set -e
cd /var/www/academia/effortacademy
rm -rf .next public .env.local
if [ -f /tmp/effortacademy-build.tar.gz ]; then
  tar -xzf /tmp/effortacademy-build.tar.gz -C .
  rm -f /tmp/effortacademy-build.tar.gz
elif [ -f /tmp/effortacademy-build.zip ]; then
  unzip -o /tmp/effortacademy-build.zip -d .
  rm -f /tmp/effortacademy-build.zip
fi
sudo chown -R ubuntu:ubuntu .next public .env.local || true
sudo chmod -R 755 .next public || true
chmod 644 .env.local || true
echo '✓ EffortAcademy atualizado com .env.local correto'
cat .env.local || true
pm2 restart academia-app || pm2 start npm --name academia-app -- start
sleep 3
pm2 logs academia-app --lines 10 || true

