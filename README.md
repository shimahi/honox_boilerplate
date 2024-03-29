# HonoX Boilerplate

### About

[HonoX](https://github.com/honojs/honox)で作成したアプリを [Cloudflare Pages](https://pages.cloudflare.com/) 上で構築するためのボイラープレートです。

### スタック

- JavaScript 実行ランタイム - [Bun](https://bun.sh/)
- ビルドツールチェイン - [Vite](https://ja.vitejs.dev/)
- ホスティング - [Cloudflare Pages](https://pages.cloudflare.com/)
- FW - [HonoX](https://github.com/honojs/honox)
- データベース - [Cloudflare D1](https://developers.cloudflare.com/d1/) (ローカルでは[SQLite](https://bun.sh/docs/api/sqlite))
- ORM - [Drizzle](https://orm.drizzle.team/)
- レンダーエンジン - [hono/jsx](https://hono.dev/guides/jsx)
- Linter & Formatter - [Biome](https://biomejs.dev/ja/)
- テスト [Bun](https://bun.sh/docs/cli/test)

### ローカル環境構築

0. Cloudflare Pages のプロジェクトと Cloudflare D1 のプロジェクトを作成する。

- [Get started - Pages](https://developers.cloudflare.com/pages/get-started/guide/)

- [Get started - D1](https://developers.cloudflare.com/d1/get-started)

wrangler を用いて CLI から Cloudflare にログインする

1. ローカル環境のセットアップコマンドを実行。
   パッケージインストールと環境変数ファイルのコピーが行われる。

```bash
# ローカル環境のセットアップ
$ bun setup
```

2. コピーされた環境変数ファイルに対して、プロジェクトやアプリの情報を記述する。

- `.env` → アプリで使用する環境変数
- `wrangler.toml` → Cloudflare プロジェクトの設定

また、package.json スクリプトに書かれている `honox-db` 文字列も、自身の D1 プロジェクトの名前に変更すること

3. ローカル DB にマイグレーションを適用し、仮データを挿入する。

```bash
$ bun seed:dev
```

4. ローカルサーバーの起動し、アプリを確認する。

```bash
# ローカルサーバーの起動
$ bun dev
# → http://localhost:5173/ にアプリが起動する
```

### ディレクトリ構成

- **app/** アプリケーションの実装

  - \_\_tests\_\_/ テストコードに用いる処理を定義する
    - fixtures/ DB のテストデータに関する処理
    - mocks/ 各処理系のモックオブジェクトを作成
  - **domains/** ドメインロジックを記述する
  - **islands/** フロントエンド側でインタラクションを行うコンポーネントはここに記述する
    ここ以外でクライアントサイドのロジックは動かないので注意
  - **middlewares/** ミドルウェアを記述する
  - **repositories/** データベースを扱う処理
  - **routes/** ページコンポーネントの記述ファイル File Based Routing に基づいてテンプレートを作成する
    - \_renderer.tsx ページコンポーネントのレンダリングを行う。Hono の [JSX Renderer Middleware](https://hono.dev/middleware/builtin/jsx-renderer) が呼ばれるファイル
  - **services/** 外部サービスを扱うためのモジュールに関する処理
  - **utils/** ドメインに依存しないユーティリティロジックを記載する
  - **validators/** 入力バリデーションを定義する
  - client.ts フロント側のエントリーポイント
  - server.ts サーバー側のエントリーポイント
  - style.css グローバルで参照する CSS (リセット CSS を記述している)

- **db/** データベース関連

  - migrations drizzle-kit によって生成されたマイグレーションファイルが格納される
  - **schemas** DB のスキーマを記述する
  - seed.ts ローカル環境 DB に仮データを挿入するためのシーディング処理を記述する

- **public/** Web サーバ上に直接配置するファイル。クライアントサイドからは `/` で参照できる。

  - static の静的ファイルを格納するディレクトリ
    - style.css リモート環境ではこちらを参照している。 app/style.css と同じ内容

- ▼ その他
  - .env (ignored) アプリのローカル環境で使用する環境変数
  - .gitignore (ignored) Git の管理対象外とするファイルを記述する
  - biome.json フォーマットと Linter を兼ねる Biome の設定ファイル
  - bun.lockb パッケージとその依存関係のバージョンを固定するためのファイル
  - drizzle.config.ts Drizzle の設定ファイル ローカル DB のマイグレーション設定が記述されている
  - lefthook.yml Git コミット時に呼ばれるコマンドを設定するファイル
  - package.json パッケージの依存関係とスクリプトを記述するファイル
  - README.md あなたが今読んでいるやつ
  - tsconfig.json TypeScript の設定ファイル
  - vite.config.ts Vite の設定ファイル
  - wrangler.toml (ignored) Cloudflare の設定ファイル

### DB スキーマ更新のマイグレーション

`db/schemas/index.ts` にはデータベースのスキーマが drizzle で定義されており、また`db/seed.ts` にはローカル DB に仮データを挿入するためのシーディング処理が実装されている。

これらのファイルを編集した後、以下のコマンドでマイグレーションを実行する。

```bash
# マイグレーションファイルの生成
$ bun migrate:gen

# ローカルDBにマイグレーションを適用
$ bun migrate:dev

# ローカルDBに仮データを挿入
$ bun seed:dev
```

### デプロイ

Cloudflare Pages と GitHub リポジトリの連携を行うと、production ブランチに push された際に自動的にデプロイが行われる。

[Deploy your site - Cloudflare Pages Doc](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)

### FIXME

`$ bun test` で呼び出されるサーバーのテストでは、 `mock.module` によるモジュールのモックがうまくリセットできなかったため、単体テストのモックの影響が別のテストに影響を与えてテストが失敗する。

cf ) package.json の "test" スクリプトの部分。ディレクトリ単位で単体テストを行い、モックの影響を疎にしている。

```
$ bun run test
```
