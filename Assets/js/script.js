// Variable global para mantener referencia al gráfico
let myChart = null;

// Función para obtener las monedas
async function getMonedas() {
    try {
        const monedaSeleccionada = document.getElementById('idMonedas').value;
        const endpoint = `https://mindicador.cl/api/${monedaSeleccionada}`;
        const res = await fetch(endpoint);
        const monedas = await res.json();
        const valorMoneda = monedas.serie[0].valor;
        const nombreMoneda = monedas.codigo;
        const serieValorMoneda = monedas.serie.slice(0, 10).reverse();
        return { valorMoneda, nombreMoneda, serieValorMoneda };
    } catch (e) {
        const errorSpan = document.getElementById("errorSpan");
        errorSpan.innerHTML = `Algo salió mal! Error: ${e.message}`;
    }
}

// Función para preparar la configuración del gráfico
function prepararConfiguracionParaLaGrafica(serieValorMoneda, moneda) {
    // Creamos las variables necesarias para el objeto de configuración
    const labels = [];
    const valores = [];

    serieValorMoneda.forEach(fechaArreglo => {
        labels.push(fechaArreglo.fecha.slice(0, 10));
        valores.push(fechaArreglo.valor);
    });

    // Configuración del gráfico
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${moneda} - Valor`,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: valores,
                borderWidth: 1,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Valor de ${moneda} en las últimas 10 fechas`
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    display: false // Oculta la leyenda en dispositivos móviles para ahorrar espacio
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fecha'
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString(); // Formatear los valores del eje Y
                        },
                        maxTicksLimit: 10 // Limitar el número de ticks en el eje Y
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        }
    };

    return config;
}


// Función para renderizar el resultado
async function renderizar(montoPesos) {
    try {
        const { valorMoneda, nombreMoneda, serieValorMoneda } = await getMonedas();
        console.log(serieValorMoneda);
        if (!isNaN(valorMoneda)) {
            const conversion = montoPesos / valorMoneda;
            document.getElementById('respuestaBoton').innerText = `${nombreMoneda} ${conversion.toFixed(2)}`;
        } else {
            document.getElementById('respuestaBoton').innerText = 'Error en la conversión';
        }

        const config = prepararConfiguracionParaLaGrafica(serieValorMoneda, nombreMoneda);
        
        // Eliminar el gráfico existente antes de crear uno nuevo
        if (myChart) {
            myChart.destroy();
        }

        const chartDOM = document.getElementById("myChart");
        myChart = new Chart(chartDOM, config);
    } catch (e) {
        console.error(`Error al renderizar: ${e.message}`);
        document.getElementById('respuestaBoton').innerText = 'Error en la conversión';
    }
}

// Añadir el evento al botón
document.getElementById('botonBuscar').addEventListener('click', async () => {
    // Actualizar el valor ingresado y convertirlo a número
    const montoClp = parseFloat(document.getElementById('montoIngresado').value);
    document.querySelector('.grafico').style.display = 'flex';
    if (!isNaN(montoClp)) {
        await renderizar(montoClp);
    } else {
        document.getElementById('respuestaBoton').innerText = 'Por favor, ingrese un número válido';
    }
});



