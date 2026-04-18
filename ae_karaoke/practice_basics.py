# Python 基礎文法 練習スクリプト

# ============================================================
# 1. 変数とデータ型
# ============================================================
print("=== 1. 変数とデータ型 ===")

name = "Kotaro"
age = 20
height = 170.5
is_student = True

print(f"名前: {name}, 型: {type(name)}")
print(f"年齢: {age}, 型: {type(age)}")
print(f"身長: {height}, 型: {type(height)}")
print(f"学生: {is_student}, 型: {type(is_student)}")

# 型変換
print(f"\n年齢を文字列に変換: {str(age)}")
print(f"文字列 '42' を数値に変換: {int('42')}")


# ============================================================
# 2. 文字列操作
# ============================================================
print("\n=== 2. 文字列操作 ===")

message = "Hello, Python!"
print(f"大文字: {message.upper()}")
print(f"小文字: {message.lower()}")
print(f"文字数: {len(message)}")
print(f"置換: {message.replace('Python', 'World')}")
print(f"分割: {message.split(', ')}")
print(f"スライス [0:5]: {message[0:5]}")

# 文字列フォーマット
print(f"\nf-string: {name}は{age}歳です")
print("format(): {}は{}歳です".format(name, age))


# ============================================================
# 3. 条件分岐
# ============================================================
print("\n=== 3. 条件分岐 ===")

score = 75

if score >= 90:
    print(f"{score}点 → A")
elif score >= 70:
    print(f"{score}点 → B")
elif score >= 50:
    print(f"{score}点 → C")
else:
    print(f"{score}点 → D")

# 三項演算子
result = "合格" if score >= 60 else "不合格"
print(f"判定: {result}")

# and / or
x = 15
if x > 10 and x < 20:
    print(f"{x} は 10 より大きく 20 より小さい")


# ============================================================
# 4. ループ
# ============================================================
print("\n=== 4. ループ ===")

# for ループ
print("for ループ (range):")
for i in range(1, 6):
    print(f"  {i}", end="")
print()

# リストのループ
fruits = ["りんご", "バナナ", "みかん"]
print("リストのループ:")
for fruit in fruits:
    print(f"  {fruit}")

# enumerate
print("enumerate:")
for i, fruit in enumerate(fruits, start=1):
    print(f"  {i}. {fruit}")

# while ループ
print("while ループ:")
n = 1
while n <= 5:
    print(f"  {n}", end="")
    n += 1
print()

# break / continue
print("break / continue:")
for i in range(1, 10):
    if i == 3:
        continue  # 3 をスキップ
    if i == 7:
        break     # 7 で終了
    print(f"  {i}", end="")
print()


# ============================================================
# 5. 関数
# ============================================================
print("\n=== 5. 関数 ===")

def greet(name, greeting="こんにちは"):
    return f"{greeting}、{name}さん！"

print(greet("Kotaro"))
print(greet("Alice", "Hello"))

# 複数の戻り値
def min_max(numbers):
    return min(numbers), max(numbers)

nums = [3, 1, 4, 1, 5, 9, 2, 6]
minimum, maximum = min_max(nums)
print(f"最小: {minimum}, 最大: {maximum}")

# 可変長引数
def total(*args):
    return sum(args)

print(f"合計: {total(1, 2, 3, 4, 5)}")

# ラムダ式
square = lambda x: x ** 2
print(f"5の二乗: {square(5)}")


# ============================================================
# 6. リスト内包表記
# ============================================================
print("\n=== 6. リスト内包表記 ===")

squares = [x ** 2 for x in range(1, 6)]
print(f"1〜5の二乗: {squares}")

evens = [x for x in range(1, 11) if x % 2 == 0]
print(f"1〜10の偶数: {evens}")

words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
print(f"大文字変換: {upper_words}")


# ============================================================
# 練習問題e
# ============================================================
print("\n=== 練習問題 ===")

# 問題1: 1〜100の合計を求める
total_sum = sum(range(1, 101))
print(f"1〜100の合計: {total_sum}")

# 問題2: FizzBuzz (1〜20)
print("FizzBuzz (1〜20):")
for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz", end=" ")
    elif i % 3 == 0:
        print("Fizz", end=" ")
    elif i % 5 == 0:
        print("Buzz", end=" ")
    else:
        print(i, end=" ")
print()

# 問題3: 素数判定
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

primes = [n for n in range(2, 30) if is_prime(n)]
print(f"30未満の素数: {primes}")
