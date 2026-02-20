"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts }: { accounts: any[] }) => {
  // 🧠 MAGIA AQUÍ: Extraemos los nombres y saldos reales de tu arreglo 'accounts'
  const accountNames = accounts.map((a) => a.institutionName || a.name || 'Banco');
  const balances = accounts.map((a) => a.currentBalance || 0);

  const data = {
    datasets: [
      {
        label: 'Saldo Disponible',
        data: balances.length > 0 ? balances : [1], // Previene error si no hay saldos
        backgroundColor: ['#653584', '#572371', '#3b174d', '#9d6dc0', '#7c45a0']
      }
    ],
    labels: accountNames.length > 0 ? accountNames : ['Sin datos']
  }

  return <Doughnut
    data={data}
    options={{
      cutout: '60%',
      plugins: {
        legend: { display: false }
      }
    }}
  />
}

export default DoughnutChart