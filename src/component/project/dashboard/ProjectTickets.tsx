import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../../context/userContext";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import * as echarts from 'echarts';
import type { Doc } from "../../../../convex/_generated/dataModel";

export const ProjectTickets = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // const [chart, setChart] = useState<echarts.ECharts | null>(null);
    const [chartData, setChartData] = useState<echarts.EChartsOption | undefined>();
    const [ticketBy, setTicketBy] = useState<'status' | 'priority' | 'assignedTo'>('assignedTo');

    const { currentEpic, currentProject } = useContext(UserContext);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const users = useQuery(api.users.get);

    useEffect(() => {
        if (chartData) {
            if (chartRef.current) {
                echarts.dispose(chartRef.current);
            }
            const myChart = echarts.init(chartRef.current, 'monitra');


            //      setChart(myChart);
            myChart.setOption(chartData);
            myChart.resize();

        }
    }, [chartData]);


    useEffect(() => {
        if (tickets && statuses && priorities && users) {
            const chartData = getChartOption(tickets, statuses, priorities, users, ticketBy);
            setChartData(chartData);
        }
    }, [tickets, statuses, priorities, users, ticketBy]);

    const getChartOption = (tickets: Doc<"tickets">[], statuses: Doc<"status">[], priorities: Doc<"priority">[], users: Doc<"users">[], ticketBy: 'status' | 'priority' | 'assignedTo') => {
        //  const workingUsers = users.filter(user => user.isActive && tickets.some(ticket => ticket.assignedTo === user._id));
        const labels = ticketBy === 'status' ? statuses.map(status => status.name) : ticketBy === 'priority' ? priorities.map(priority => priority.name) : users.map(user => user.name);

        const option: echarts.EChartsOption = {
            title: {
                text: ticketBy === 'status' ? 'Ticket Status' : ticketBy === 'priority' ? 'Ticket Priority' : 'Ticket Assigned To',
            },
            animation: false,
            tooltip: {
                trigger: 'item',
            },
            toolbox: {
                show: true,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },

                    magicType: { type: ['line', 'bar'] },
                    restore: {},
                    saveAsImage: {}
                }
            },
            legend: {
                bottom: '4%',
                type: 'scroll',
                textStyle: {
                    color: '#333',
                    fontSize: 12
                },
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#202020',
                        width: 1
                    }
                },
                axisTick: {
                    show: true
                },

                name: ticketBy === 'status' ? 'Status' : ticketBy === 'priority' ? 'Priority' : 'Assigned To',
                nameLocation: 'middle',
                nameGap: 40,
                nameTextStyle: {
                    color: '#606060',
                    fontSize: 14
                }
            },
        }
        option.xAxis = {
            type: 'category',
            position: 'bottom',
            axisLabel: {
                show: true,
                formatter: (value) => {
                    if (ticketBy === 'status') {
                        const status = statuses[parseInt(value)]?.name ?? '';
                        return status;
                    }
                    if (ticketBy === 'priority') {
                        const priority = priorities[parseInt(value)]?.name ?? '';
                        return priority;
                    }
                    if (ticketBy === 'assignedTo') {
                        const user = users[parseInt(value)]?.name ?? '';
                        return user;
                    }
                    return value;
                }
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#202020',
                    width: 1
                }
            },

            splitLine: {
                show: true,
                lineStyle: {
                    color: '#D0D0D0',
                    width: 1
                }
            },
            minorSplitLine: {
                show: true,
                lineStyle: {
                    color: '#f0f0f0',
                    width: 1
                }
            },
            nameLocation: 'middle',

            //  data: allTimePoints.map(tp => new Date(tp * 1000).toISOString())
        };
        option.series = [{
            colorBy: 'series',

            data: tickets.reduce((acc, ticket) => {
                let index = 0;
                if (ticketBy === 'status') {
                    index = statuses.findIndex(status => status._id === ticket.status);
                } else if (ticketBy === 'priority') {
                    index = priorities.findIndex(priority => priority._id === ticket.priority);
                } else if (ticketBy === 'assignedTo') {
                    index = users.findIndex(user => user._id === ticket.assignedTo);
                }

                acc[index].value++;
                return acc;
            }, Array(labels.length).fill(({ value: 0, name: '' })).map((item, index) => ({ ...item, name: labels[index] })) as { value: number, name: string }[]),
            type: 'bar',
        }];

        return option;
    }

    return <div ref={containerRef} className='w-full h-full min-w-[400px] min-h-[450px] overflow-hidden'>
        <div className="flex items-center justify-end space-x-2 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">

                <button className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${ticketBy === 'status'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`} onClick={() => setTicketBy('status')}>Status</button>
                <button className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${ticketBy === 'priority'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`} onClick={() => setTicketBy('priority')}>Priority</button>
                <button className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${ticketBy === 'assignedTo'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`} onClick={() => setTicketBy('assignedTo')}>Assigned To</button>
            </div>
        </div>
        <div ref={chartRef} className='relative max-w-full w-full h-full  min-w-[400px] min-h-[450px]'>
        </div>
    </div>
}


