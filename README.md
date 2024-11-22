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
	./$1 < $i > outcp$cnt.txt
	sed -i 's/[ \t]*$//' outcp$cnt.txt
	if !(cmp -s "outcp$cnt.txt" "expcp$cnt.txt")
	then
		echo -e "\e[101mError in test $cnt!\e[0m"
		echo -e "\e[103;100mInput\e[0m"
		cat $i
		echo -e "\e[41mWrong Output\e[0m"
		cat outcp$cnt.txt
		echo -e "\e[44;33mCorrect Output\e[0m"
		cat expcp$cnt.txt
	else
		echo -e "\e[42;97mPassed $cnt\e[0m"
	fi
	cnt=$((cnt+1))
done;
```

All the input and expected files are stored in my `~/ccode` folder and I compile through these files using a vim shortcut.

```vimrc
autocmd FileType cpp map <F5> :w<CR>:!clear && bash ~/ccode/runtests.sh %<<CR>
```

For creating new testcase I have `newtest.sh` file. I use `ctrl + d` to take expected value and again `ctrl + d` will terminate the bash script.

```bash
#!/bin/bash

cnt=0
for i in incp*.txt; do
	cnt=$((cnt + 1));
done;

echo -e "\e[4mInput $cnt\e[0m"
cat > tempInp.txt 

echo -e "\e[4mExpected $cnt\e[0m"
cat > tempExp.txt

cat tempInp.txt > incp$cnt.txt
cat tempExp.txt > expcp$cnt.txt
```

I have created a shorcut for creating a new testcase using `F4` in vim.

```vimrc
autocmd FileType cpp map <F4> :!clear && bash ~/ccode/newtest.sh %<<CR>
```
