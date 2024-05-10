# Parse Tree

Estaba sin inspiración alguna así que aproveche mi tiempo libre para realizar un visualizador de árboles sintácticos,
aprovechando que en mi materia actual de la facultad estamos haciendo ejercicios con las mismas y el graficarlo se
vuelve tedioso.

`App creada para resolver un problema de la clase Compiladores de la Facultad Nihon Gakko.`

## Ejemplo del PDF

![Ejemplo](https://i.imgur.com/7KppX3j.png)

Podemos apreciar la generación del árbol utilizando `(2 + 3) * (10 - 5)` como parámetro.

## Renderización

![Render](https://i.imgur.com/KGVXmXR.png)

## Datos de Ejemplo

- 5 – 3 * 2 + 4 – 4 / 2
- ( 4 + 3 ) – ( 3 * 2 ) + 1
- 3 * ( 4 * 2 – 3 ) – ( 4 + 6 / 3 )
- 2 { 4 [ 7 + 4 ( 5 * 3 – 9 ) ] – 3 ( 40 – 8 ) }
- ( 5 + 3 * 2 / 6 – 4 ) ( 4 / 2 – 3 + 6 ) / ( 7 – 8 / 2 – 2 ) ^ 2
- [ ( 17 – 15 ) ^ 3 + ( 7 + 12 ) ^ 2 / [ ( 6 – 7 ) * ( 12 – 23 ) ]]

## TODO

- [ ] Separar responsabilidades en componentes (Dudo que revisite esto)
