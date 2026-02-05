'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  hormigaTotal: number;
  necesarioTotal: number;
}

export default function ExpenseChart({ hormigaTotal, necesarioTotal }: Props) {
  // Preparamos los datos para el gráfico
  const data = [
    { name: 'Necesarios', value: necesarioTotal, color: '#4ade80' }, // Verde
    { name: 'Hormiga', value: hormigaTotal, color: '#ef4444' },      // Rojo
  ];

  // Si no hay gastos, mostramos un mensaje
  if (hormigaTotal === 0 && necesarioTotal === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">Sin datos aún</div>;
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-center font-bold text-gray-700 mb-2 text-sm">Distribución de Gastos</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Esto lo hace una "Dona"
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString('es-CL')}`}
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}