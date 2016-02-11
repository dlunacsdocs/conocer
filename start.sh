chmod 0777 -R ./Configuracion
chmod 0777 -R ./Estructuras
chmod 0777 -R ./Log
chmod 0777 -R ./Download
chmod 0777 -R ./Fifo

cp Configuracion/DataBaseSettings/Index.xml /volume1/@appstore/MariaDB/usr/share/mysql/charsets/Index.xml
cp Configuracion/DataBaseSettings/latin1.xml /volume1/@appstore/MariaDB/usr/share/mysql/charsets/latin1.xml