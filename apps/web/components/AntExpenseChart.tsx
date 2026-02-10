"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

interface AntExpenseChartProps {
  data: {
    antCategory: string;
    amount: number;
  }[];
}

const AntExpenseChart = ({ data }: AntExpenseChartProps) => {
  const chartData = data.reduce((acc: any[], current) => {
    const existing = acc.find(item => item.name === current.antCategory);
    const amount = Math.abs(current.amount); 

    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: current.antCategory, value: amount });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm min-h-[400px]">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-gray-900">Análisis de Gastos Hormiga</h3>
        <p className="text-sm text-gray-500">Distribución de tus fugas de dinero</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString('es-CL')}`}
            />
            <Legend verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AntExpenseChart; // 👈 ASEGÚRATE DE QUE ESTA LÍNEA EXISTA