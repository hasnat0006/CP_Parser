# Competitive Companion Example

This is an example on how to retrieve parsed problem data from [Competitive Companion](https://github.com/jmerle/competitive-companion).

## Instructions

1. Clone this repository and `cd` into it.
2. Run `npm install`.
3. Customize `CP_FOLDER` in `.env` where you want to store and input and expected files.
4. Run `npm start`.
5. Go to a problem like [this](http://codeforces.com/problemset/problem/1/A) one, click on the green plus icon and look at the terminal where you ran `npm start`.

I use vim and I code in `~/ccode` folder where I written a bash script named `runtests.sh`.

```bash
#!/bin/bash

g++ $1.cpp -Wall -DONPC -o $1

cnt=0
for i in incp*.txt; do
	echo "Running test $((cnt+1))"
	./$1 < $i > outcp$cnt.txt
	if !(cmp -s "outcp$cnt.txt" "expcp$cnt.txt")
	then
		echo "Error found!"
		echo -e "\e[4mInput\e[0m"
		cat $i
		echo -e "\e[4mWrong Output\e[0m"
		cat outcp$cnt.txt
		echo -e "\e[4mCorrect Output\e[0m"
		cat expcp$cnt.txt
	fi
	cnt=$((cnt+1))
done;
```

All the input and expected files are stored in my `~/ccode` folder and I compile through these files using a vim shortcut.

```vimrc
autocmd FileType cpp map <F5> :w<CR>:!clear && bash ~/ccode/runtests.sh %<<CR>
```
