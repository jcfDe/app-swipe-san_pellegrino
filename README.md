# app-swipe-san_pellegrino

Esta es una aplicación móvil escrita en HTML, CSS y JavaScript que permite a los usuarios votar por imágenes utilizando la función de swipe (deslizar) al estilo de Tinder.

### Cómo funciona
La aplicación muestra una lista de imágenes en la pantalla principal. Los usuarios pueden deslizar hacia la izquierda para indicar que no les gusta la imagen o hacia la derecha para indicar que les gusta. Cuando un usuario desliza hacia la izquierda o hacia la derecha, la siguiente imagen se carga automáticamente.

Las votaciones se almacenan en localStorage y el resultado final se envía a una Lambda de AWS y almacena los datos en una tabla de DynamoDB.

### Requisitos
Para utilizar esta aplicación, necesitarás un dispositivo móvil con un navegador web moderno instalado. La aplicación ha sido probada en dispositivos iOS y Android.
