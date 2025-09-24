# 📐 Примеры LaTeX формул для тестирования

Этот файл содержит примеры LaTeX формул, которые можно использовать для тестирования бота.

## Базовые математические выражения

### Дроби
```
\frac{a}{b}
\frac{x^2 + y^2}{2xy}
\frac{\sin x}{\cos x} = \tan x
```

### Корни
```
\sqrt{x}
\sqrt[3]{x^2 + y^2}
\sqrt{\frac{a}{b}}
```

### Степени и индексы
```
x^2 + y^2 = z^2
a_{i,j} = b_{i} + c_{j}
x^{n+1} = x^n \cdot x
```

## Продвинутые математические конструкции

### Суммы и произведения
```
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\prod_{k=1}^{n} k = n!
\sum_{n=0}^{\infty} \frac{x^n}{n!} = e^x
```

### Интегралы
```
\int_0^1 x^2 dx = \frac{1}{3}
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
\iint_D f(x,y) dx dy
```

### Пределы
```
\lim_{x \to 0} \frac{\sin x}{x} = 1
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
```

## Греческие буквы и символы

### Греческие буквы
```
\alpha, \beta, \gamma, \delta, \epsilon
\theta, \lambda, \mu, \nu, \pi, \rho
\sigma, \tau, \phi, \chi, \psi, \omega
```

### Математические операторы
```
\leq, \geq, \neq, \approx, \equiv
\in, \notin, \subset, \supset
\cup, \cap, \emptyset, \infty
```

### Стрелки
```
\rightarrow, \leftarrow, \leftrightarrow
\Rightarrow, \Leftarrow, \Leftrightarrow
\uparrow, \downarrow, \updownarrow
```

## Матрицы и системы уравнений

### Матрицы
```
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}

\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
```

### Системы уравнений
```
\begin{cases}
x + y = 1 \\
x - y = 0
\end{cases}
```

## Физические формулы

### Классическая механика
```
F = ma
E = \frac{1}{2}mv^2
F = G\frac{m_1 m_2}{r^2}
```

### Электродинамика
```
F = q(E + v \times B)
\nabla \cdot E = \frac{\rho}{\epsilon_0}
\nabla \times E = -\frac{\partial B}{\partial t}
```

### Квантовая механика
```
\hat{H}\psi = E\psi
\Delta x \Delta p \geq \frac{\hbar}{2}
\psi(x,t) = Ae^{i(kx - \omega t)}
```

## Химические формулы

### Химические уравнения
```
H_2 + Cl_2 \rightarrow 2HCl
CaCO_3 + 2HCl \rightarrow CaCl_2 + H_2O + CO_2
```

### Структурные формулы
```
CH_3-CH_2-OH
C_6H_6 (бензол)
```

## Логика и теория множеств

### Логические операторы
```
\forall x \in \mathbb{R}, x^2 \geq 0
\exists y \in \mathbb{N}, y > x
P \land Q \lor \neg R
```

### Теория множеств
```
A \cup B = \{x : x \in A \text{ или } x \in B\}
A \cap B = \{x : x \in A \text{ и } x \in B\}
|A| = \text{количество элементов в } A
```

## Как использовать эти примеры

1. Скопируйте любую формулу из этого файла
2. Отправьте её боту как обычное сообщение
3. Бот автоматически распознает LaTeX и преобразует в изображение
4. Или используйте команду `/latex формула`

## Советы по написанию LaTeX

- Используйте обратные слеши для команд: `\frac`, `\sqrt`, `\sum`
- Группируйте выражения в фигурных скобках: `{x^2 + y^2}`
- Для индексов используйте `_`, для степеней `^`
- Для пробелов используйте `\ ` или `\quad`
- Для переносов строк используйте `\\`
