const configurations = {
    configLicence: {
        noOfEps: [
            { industryLow: 1 },
            { industryAvg: 2 },
            { industryHigh: 3 }
        ],
        licenceTerm: [
            { industryLow: 12 },
            { industryAvg: 36 },
            { industryHigh: 60 }
        ]
    },
    configServiceDesk: {
        tL1Cost: [
            { industryLow: 4.24 },
            { industryAvg: 22.00 },
            { industryHigh: 52.12 }
        ],
        tL2Cost: [
            { industryLow: 13.31 },
            { industryAvg: 69.00 },
            { industryHigh: 163.48 }
        ],
        tL3Cost: [
            { industryLow: 20.07 },
            { industryAvg: 104.00 },
            { industryHigh: 246.40 }
        ],
        noOfL1TicketsPerUM: [
            { industryLow: 0.22 },
            { industryAvg: 0.89 },
            { industryHigh: 1.46 }
        ],
        noOfL2TicketsPerUM: [
            { industryLow: 2.2 },
            { industryAvg: 25.7 },
            { industryHigh: 62.4 }
        ],
        noOfL3TicketsPerUM: [
            { industryLow: 2.2 },
            { industryAvg: 25.7 },
            { industryHigh: 62.4 }
        ]
    },
    configDesktopSupport: {
        desktopSupportTicketPerc: [
            { industryLow: 39 },
            { industryAvg: 62 },
            { industryHigh: 91 }
        ]
    },
    configHardware: {
        deviceCost: [
            { industryLow: 500 },
            { industryAvg: 1000 },
            { industryHigh: 3000 }
        ],
        deviceRefresh: [
            { industryLow: 5 },
            { industryAvg: 4 },
            { industryHigh: 3 }
        ]
    },
    configSoftware: {
        costPerUser: [
            { industryLow: 83 },
            { industryAvg: 206 },
            { industryHigh: 826 }
        ]
    },
    configUserProductivity: {
        hourlyPrice: [
            { industryLow: 11 },
            { industryAvg: 17 },
            { industryHigh: 32 }
        ],
        waitTime: [
            { industryLow: 0.76 },
            { industryAvg: 1.18 },
            { industryHigh: 1.89 }
        ],
        avgTimeSpentonPc: [
            { industryLow: 59.40 },
            { industryAvg: 67.40 },
            { industryHigh: 72.60 }
        ]
    },
    reductionInMTR: {
        firstYear: [
            { industryLow: 5 },
            { industryAvg: 15 },
            { industryHigh:25 }
        ],
        subsYear: [
            { industryLow: 5 },
            { industryAvg: 15 },
            { industryHigh:25 }
        ]
    },
    reductionInDesktopSupportTickets: {
        firstYear: [
            { industryLow: 5 },
            { industryAvg: 15 },
            { industryHigh:25 }
        ],
        subsYear: [
            { industryLow: 5 },
            { industryAvg: 15 },
            { industryHigh:25 }
        ]
    },
    reductionInSoftware: {
        firstYear: [
            { industryLow: 0.5 },
            { industryAvg: 12.5 },
            { industryHigh:37 }
        ]
    },
    phasedDelivery: {
        desktopSupport: [
            { industryLow: 0 },
            { industryAvg: 1 },
            { industryHigh: 1 }
        ],
        deviceRefresh: [
            { industryLow: 0 },
            { industryAvg: 2 },
            { industryHigh: 3 }
        ],
        softwareLicence: [
            { industryLow: 0 },
            { industryAvg: 3 },
            { industryHigh: 5 }
        ],
        userProductivity: [
            { industryLow: 0 },
            { industryAvg: 4 },
            { industryHigh: 7 }
        ]
    },
};

module.exports = {
    configurations
}
