// Ustawia hasło administratora (tworzy konto, jeśli nie istnieje).
// Użycie: npm run admin:password -- admin@twojadomena.pl
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import readline from 'node:readline'

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const output = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream }
    output._writeToOutput = (s: string) => {
      // Nie pokazujemy wpisywanych znaków
      if (s.startsWith(question)) output.output.write(question)
    }
    rl.question(question, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    console.error('Podaj e-mail: npm run admin:password -- admin@twojadomena.pl')
    process.exit(1)
  }

  const password = await askHidden('Nowe hasło (min. 12 znaków): ')
  if (password.length < 12) {
    console.error('Hasło musi mieć co najmniej 12 znaków.')
    process.exit(1)
  }
  const repeat = await askHidden('Powtórz hasło: ')
  if (repeat !== password) {
    console.error('Hasła się różnią.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  const hashed = await hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed, name: 'Administrator', role: 'ADMIN' },
  })
  await prisma.$disconnect()
  console.log(`Gotowe – hasło ustawione dla ${user.email}.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
