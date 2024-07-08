#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Step 1: Update and upgrade the system
sudo apt-get update
sudo apt-get upgrade -y

# Step 2: Create a new user 'stack' with password
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

# Step 3: Add stack user to sudoers file
echo "Adding stack user to sudoers..."
echo "stack ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers

# Step 4: Switch to stack user and configure devstack
echo "Switching to stack user and configuring devstack..."
sudo -i -u stack bash << 'EOF'
    set -e

    git clone https://git.openstack.org/openstack-dev/devstack ~/devstack

    echo "Configuring local.conf..."
    cp ~/devstack/samples/local.conf ~/devstack/local.conf

    # Prompt for passwords
    read -sp "Enter ADMIN_PASSWORD: " ADMIN_PASSWORD
    echo ""
    read -sp "Confirm ADMIN_PASSWORD: " ADMIN_PASSWORD_CONFIRM
    echo ""
    read -sp "Enter DATABASE_PASSWORD: " DATABASE_PASSWORD
    echo ""
    read -sp "Confirm DATABASE_PASSWORD: " DATABASE_PASSWORD_CONFIRM
    echo ""
    read -sp "Enter RABBIT_PASSWORD: " RABBIT_PASSWORD
    echo ""
    read -sp "Confirm RABBIT_PASSWORD: " RABBIT_PASSWORD_CONFIRM
    echo ""
    read -sp "Enter SERVICE_PASSWORD: " SERVICE_PASSWORD
    echo ""
    read -sp "Confirm SERVICE_PASSWORD: " SERVICE_PASSWORD_CONFIRM
    echo ""

    if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" || "$DATABASE_PASSWORD" != "$DATABASE_PASSWORD_CONFIRM" || "$RABBIT_PASSWORD" != "$RABBIT_PASSWORD_CONFIRM" || "$SERVICE_PASSWORD" != "$SERVICE_PASSWORD_CONFIRM" ]]; then
        echo "Passwords do not match. Exiting..."
        exit 1
    fi

    # Update local.conf
    sed -i "s/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DATABASE_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^RABBIT_PASSWORD=.*/RABBIT_PASSWORD=$RABBIT_PASSWORD/" ~/devstack/local.conf
    sed -i "s/^SERVICE_PASSWORD=.*/SERVICE_PASSWORD=$SERVICE_PASSWORD/" ~/devstack/local.conf
    sed -i "/^SERVICE_PASSWORD=/a HOST_IP=10.208.0.10" ~/devstack/local.conf
    echo "FLOATING_RANGE=10.0.2.224/27" >> ~/devstack/local.conf

    # Step 6: Ensure Open vSwitch service is running
    echo "Ensuring Open vSwitch service is running..."
    sudo service openvswitch-switch start

    # Step 7: Start the installation
    echo "Starting installation..."
    cd ~/devstack
    ./stack.sh
EOF

# Wait for 30-45 minutes for the installation to complete

# Step 8: Access the OpenStack dashboard
echo "Installation successful! Access the OpenStack dashboard at http://localhost"
echo "Login credentials:"
echo "Username: admin"
echo "Password: $ADMIN_PASSWORD"
