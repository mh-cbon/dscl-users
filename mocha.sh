# set -e


vagrant up maverick
vagrant rsync maverick
vagrant ssh maverick -c "sh /Users/vagrant/wd/vagrant/node-setup-mac.sh"
vagrant ssh maverick -c "sh /Users/vagrant/wd/vagrant/run-tests-mac.sh"
vagrant halt maverick

exit


vagrant up yosemite
vagrant rsync yosemite
vagrant ssh yosemite -c "sh /Users/vagrant/wd/vagrant/node-setup-mac.sh"
vagrant ssh yosemite -c "sh /Users/vagrant/wd/vagrant/run-tests-mac.sh"
vagrant halt yosemite
