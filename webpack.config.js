import path from "path"

const rootDir = process.cwd()

const srcFolder = path.resolve(rootDir, "src")

export default {
  mode: "production",
  entry: {
    bundle: "./src/background.ts",
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          }
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: "defaults",
            presets: [
              ['@babel/preset-env']
            ]
          }
        }
      }
    ],
  },
  resolve: {
    alias: {
      "@/*": srcFolder,
    },
    modules: ["node_modules", srcFolder],
    extensions: [".ts", ".js"],
  },
}