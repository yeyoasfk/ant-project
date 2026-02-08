"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts }: { accounts: any[] }) => {
  // Datos simulados para el diseño (luego conectaremos tus datos reales de Fintoc)
  const data = {
    datasets: [
      {
        label: 'Saldo',
        data: [125000, 250000, 50000], // Ej: Santander, BancoEstado, Falabella
        backgroundColor: ['#0747b6', '#2265d8', '#2f91fa'] 
      }
    ],
    labels: ['Santander', 'Banco Estado', 'Falabella']
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