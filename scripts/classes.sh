#!/bin/sh
dir=`dirname $0`
cd $dir/../src
fileList=$(grep -R "export class" * | cut -d':' -f2| sed 's/export class //g' | sed 's/ .*//' | sort | uniq)
for class in $fileList
do
	#grep "new $class" */*.ts
	nb=$(find . -name "*.ts" -exec grep "$class" {} \; | grep "import" | wc -l)
	echo "$nb : $class "
done
