#!/bin/bash

set -e


sudo apt-get update
sudo apt-get upgrade -y


read -sp "Enter password for stack user: " STACK_PASSWORD
echo ""
read -sp "Confirm password for stack user: " STACK_PASSWORD_CONFIRM
echo ""

if [[ "$STACK_PASSWORD" != "$STACK_PASSWORD_CONFIRM" ]]; then
    echo "Passwords do not match. Exiting..."
    exit 1
fi

sudo useradd -m -s /bin/bash stack
echo "stack:$STACK_PASSWORD" | sudo chpasswd


echo "Adding stack user to sudoers..."
echo "stack ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers


read -sp "Enter ADMIN_PASSWORD: " ADMIN_PASSWORD
echo ""
read -sp "Confirm ADMIN_PASSWORD: " ADMIN_PASSWORD_CONFIRM
echo ""

if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" || "$DATABASE_PASSWORD" != "$DATABASE_PASSWORD_CONFIRM" || "$RABBIT_PASSWORD" != "$RABBIT_PASSWORD_CONFIRM" || "$SERVICE_PASSWORD" != "$SERVICE_PASSWORD_CONFIRM" ]]; then
    echo "Passwords do not match. Exiting..."
    exit 1
fi


sudo -i -u stack bash << EOF
    set -e

    git clone https://git.openstack.org/openstack-dev/devstack ~/devstack

    echo "Configuring local.conf..."
    cp ~/devstack/samples/local.conf ~/devstack/local.conf

    # Update local.conf
    sed -i "s/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$ADMIN_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^RABBIT_PASSWORD=.*/RABBIT_PASSWORD=$ADMIN_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^SERVICE_PASSWORD=.*/SERVICE_PASSWORD=$ADMIN_PASSWORD/" ~/devstack/local.conf
    sed -i "/^SERVICE_PASSWORD=/a HOST_IP=192.168.1.120 ~/devstack/local.conf
   
    # Ensure Open vSwitch service is running
    echo "Ensuring Open vSwitch service is running..."
    sudo service openvswitch-switch start

    # Start the installation
    echo "Starting installation..."
    cd ~/devstack
    ./stack.sh
EOF


echo "Installation successful! Access the OpenStack dashboard at http://localhost"
echo "Login credentials:"
echo "Username: admin"
echo "Password: $ADMIN_PASSWORD"
