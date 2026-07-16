defmodule GitBeholder.Integrations.EncryptedBinary do
  @moduledoc """
  An `Ecto.Type` that transparently encrypts binaries at rest using
  `Plug.Crypto.MessageEncryptor`, so callers above the schema layer never
  handle ciphertext or plaintext credential bytes directly.
  """

  use Ecto.Type

  alias Plug.Crypto.{KeyGenerator, MessageEncryptor}

  @salt "git_beholder.integrations.credentials"

  def type, do: :binary

  def cast(value) when is_binary(value), do: {:ok, value}
  def cast(_value), do: :error

  def dump(value) when is_binary(value) do
    secret = derive_key()
    {:ok, MessageEncryptor.encrypt(value, secret, secret)}
  end

  def dump(_value), do: :error

  def load(value) when is_binary(value) do
    secret = derive_key()

    case MessageEncryptor.decrypt(value, secret, secret) do
      {:ok, plain_text} -> {:ok, plain_text}
      :error -> :error
    end
  end

  defp derive_key do
    base_secret = Application.fetch_env!(:git_beholder, :integrations_encryption_key)
    KeyGenerator.generate(base_secret, @salt)
  end
end
