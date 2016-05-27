# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # on fedora-like, you must use the downloadable package of vagrant
  # available on hashi corp website.
  # The per distrib provided package wont provide winrm support..
  # see https://www.vagrantup.com/downloads.html

  config.vm.define :yosemite do |yosemite|
    yosemite.vm.box = "AndrewDryga/vagrant-box-osx"
    yosemite.vm.synced_folder ".", "/Users/vagrant/wd", type: "rsync"
    yosemite.vm.network :private_network, ip: "10.1.1.10"
    yosemite.vm.provider "virtualbox" do |vb|
      # note that those options are required to let the system boot properly
      # Otherwise, it won t restart our services
      # thanks to https://gist.github.com/WayneBuckhanan/15de1bb8b3fb3bd4f7af
      # Last note, the gui window is not required.
      vb.gui = false
      vb.gui = true
      vb.memory = "1512"
      # vb.customize ["modifyvm", :id, "--chipset", "ich9"]
      vb.customize ["setextradata", :id, "VBoxInternal2/EfiGopMode", "1"]
      # vb.customize ["modifyvm", :id, "--cpuidset", "00000001","000206a7","02100800","1fbae3bf","bfebfbff"] # get OSX to boot past "hfs ..." message
      vb.customize ["modifyvm", :id, "--cpuidset", "00000001","000306a9","00020800","80000201","178bfbff"] # boot past "Missing Bluetooth Controller Transport" error
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemProduct", "MacBookPro11,3"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemVersion", "1.0"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiBoardProduct", "Iloveapple"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/DeviceKey", "ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/GetKeyFromRealSMC", "1"]
    end
  end

  config.vm.define :maverick do |maverick|
    maverick.vm.box = "http://files.dryga.com/boxes/osx-mavericks-0.1.0.box"
    maverick.vm.synced_folder ".", "/Users/vagrant/wd", type: "rsync"
    maverick.vm.network :private_network, ip: "10.1.1.10"
    maverick.vm.provider "virtualbox" do |vb|
      # note that those options are required to let the system boot properly
      # Otherwise, it won t restart our services
      # thanks to https://gist.github.com/WayneBuckhanan/15de1bb8b3fb3bd4f7af
      # Last note, the gui window is not required.
      vb.gui = false
      vb.memory = "1512"
      # vb.customize ["modifyvm", :id, "--chipset", "ich9"]
      vb.customize ["setextradata", :id, "VBoxInternal2/EfiGopMode", "1"]
      # vb.customize ["modifyvm", :id, "--cpuidset", "00000001","000206a7","02100800","1fbae3bf","bfebfbff"] # get OSX to boot past "hfs ..." message
      vb.customize ["modifyvm", :id, "--cpuidset", "00000001","000306a9","00020800","80000201","178bfbff"] # boot past "Missing Bluetooth Controller Transport" error
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemProduct", "MacBookPro11,3"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemVersion", "1.0"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiBoardProduct", "Iloveapple"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/DeviceKey", "ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc"]
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/GetKeyFromRealSMC", "1"]
    end
  end


end
