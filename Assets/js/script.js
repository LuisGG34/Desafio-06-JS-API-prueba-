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
                backgroundColor: 'red',
                borderColor: 'red',
                data: valores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Valor de ${moneda} en las últimas 10 fechas`
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            },
            // Configuración del fondo del gráfico
            elements: {
                point: {
                    backgroundColor: 'rgba(54, 162, 235, 1)'
                },
                line: {
                    backgroundColor: 'rgba(54, 162, 235, 1)'
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



