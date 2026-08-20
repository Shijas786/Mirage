use starknet::ContractAddress;

// Must match privacy::objects::OpenNoteDeposit (positional Serde).
#[derive(Serde, Copy, Drop, PartialEq, Debug)]
pub struct OpenNoteDeposit {
    pub note_id: felt252,
    pub token: ContractAddress,
    pub amount: u128,
}

#[starknet::interface]
pub trait IErc20<TState> {
    fn balance_of(self: @TState, account: ContractAddress) -> u256;
    fn approve(ref self: TState, spender: ContractAddress, amount: u256) -> bool;
    fn transferFrom(ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
pub trait IMirageDarkPool<TState> {
    // Called by the privacy pool via selector!("privacy_invoke").
    fn privacy_invoke(
        ref self: TState,
        token: ContractAddress,
        pool_address: ContractAddress,
        note_id: felt252
    ) -> Span<OpenNoteDeposit>;
    
    // Custom RFQ matching logic
    fn submit_intent(ref self: TState, token_in: ContractAddress, token_out: ContractAddress, min_amount_out: u128);
    fn get_active_intents(self: @TState) -> u64;
}

#[starknet::contract]
mod MirageDarkPool {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use super::{IErc20Dispatcher, IErc20DispatcherTrait, OpenNoteDeposit};

    mod errors {
        pub const BAD_POOL: felt252 = 'BAD_POOL';
        pub const NO_INPUT: felt252 = 'NO_INPUT';
        pub const AMOUNT_OVERFLOW: felt252 = 'AMOUNT_OVERFLOW';
    }

    #[storage]
    struct Storage {
        active_intents_count: u64,
        last_note_id: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        IntentSubmitted: IntentSubmitted,
        TradeFilled: TradeFilled,
    }

    #[derive(Drop, starknet::Event)]
    struct IntentSubmitted {
        #[key]
        note_id: felt252,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct TradeFilled {
        #[key]
        note_id: felt252,
        amount_filled: u128,
    }

    #[abi(embed_v0)]
    impl MirageImpl of super::IMirageDarkPool<ContractState> {
        fn privacy_invoke(
            ref self: ContractState,
            token: ContractAddress,
            pool_address: ContractAddress,
            note_id: felt252,
        ) -> Span<OpenNoteDeposit> {
            // Validate pool address
            let caller = get_caller_address();
            assert(pool_address == caller, errors::BAD_POOL);

            let erc20 = IErc20Dispatcher { contract_address: token };
            let balance: u256 = erc20.balance_of(get_contract_address());
            let amount: u128 = balance.try_into().expect(errors::AMOUNT_OVERFLOW);
            assert(amount != 0, errors::NO_INPUT);

            // In a real dark pool, we would match this against an existing intent.
            // For now, this echoes the deposit back to the pool to fulfill the note.
            erc20.approve(pool_address, balance);

            self.last_note_id.write(note_id);
            self.emit(IntentSubmitted { note_id, amount });

            array![OpenNoteDeposit { note_id, token, amount }].span()
        }

        fn submit_intent(ref self: ContractState, token_in: ContractAddress, token_out: ContractAddress, min_amount_out: u128) {
            self.active_intents_count.write(self.active_intents_count.read() + 1);
        }

        fn get_active_intents(self: @ContractState) -> u64 {
            self.active_intents_count.read()
        }
    }
}
